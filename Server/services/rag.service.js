import fs from "node:fs/promises";
import mongoose from "mongoose";
import DocumentChunk from "../models/DocumentChunk.js";
import { embedQuery, embedTexts } from "./embedding.service.js";

const TARGET_CHARS = 800;
const OVERLAP_CHARS = 100;

function splitLongParagraph(paragraph, maxChars) {
  const pieces = [];
  let remaining = paragraph.trim();
  while (remaining.length > maxChars) {
    let splitAt = remaining.lastIndexOf(" ", maxChars);
    if (splitAt < Math.floor(maxChars * 0.6)) splitAt = maxChars;
    pieces.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(Math.max(0, splitAt - OVERLAP_CHARS)).trim();
  }
  if (remaining) pieces.push(remaining);
  return pieces;
}

export function chunkText(text, { targetChars = TARGET_CHARS, overlapChars = OVERLAP_CHARS } = {}) {
  const paragraphs = String(text).replace(/\r\n?/g, "\n").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const parts = paragraph.length > targetChars ? splitLongParagraph(paragraph, targetChars) : [paragraph];
    for (const part of parts) {
      if (!current) {
        current = part;
      } else if (`${current}\n\n${part}`.length <= targetChars) {
        current += `\n\n${part}`;
      } else {
        chunks.push(current);
        const overlap = current.slice(-overlapChars).trim();
        current = overlap ? `${overlap}\n\n${part}` : part;
        if (current.length > targetChars) {
          const splitParts = splitLongParagraph(current, targetChars);
          current = splitParts.pop() || "";
          chunks.push(...splitParts);
        }
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export async function ingestDocument(filePath, documentName, category, planTier) {
  if (!documentName || !category || !planTier) {
    throw new TypeError("documentName, category, and planTier are required.");
  }
  if (mongoose.connection.readyState !== 1) {
    const error = new Error("MongoDB is not connected; document ingestion cannot proceed.");
    error.statusCode = 503;
    error.isOperational = true;
    throw error;
  }
  const text = await fs.readFile(filePath, "utf8");
  const chunks = chunkText(text);
  if (!chunks.length) return { insertedCount: 0, documentName };
  const embeddings = await embedTexts(chunks, { taskType: "RETRIEVAL_DOCUMENT" });
  const documents = chunks.map((content, index) => ({
    documentName,
    category: category.toLowerCase(),
    planTier,
    content,
    embedding: embeddings[index],
  }));
  try {
    const result = await DocumentChunk.insertMany(documents, { ordered: true });
    return { insertedCount: result.length, documentName };
  } catch (error) {
    console.error("CHAT_ERROR_DETAIL:", error);
    if (mongoose.connection.readyState !== 1) {
      error.statusCode = 503;
      error.isOperational = true;
      error.message = "MongoDB connection failed while inserting document chunks.";
    }
    throw error;
  }
}

export async function retrieveRelevantChunks(queryText, planTier, limit = 4) {
  if (mongoose.connection.readyState !== 1) {
    const error = new Error("MongoDB is not connected; policy search is unavailable.");
    error.statusCode = 503;
    error.isOperational = true;
    throw error;
  }
  const boundedLimit = Math.min(20, Math.max(1, Number.parseInt(limit, 10) || 4));
  const queryVector = await embedQuery(queryText);
  const tiers = [...new Set([planTier, "support", "All"].filter((tier) => typeof tier === "string" && tier.trim()).map((tier) => tier.trim()))];
  const filter = { planTier: { $in: tiers } };
  const vectorStage = {
    index: process.env.ATLAS_VECTOR_INDEX || "vector_index",
    path: "embedding",
    queryVector,
    numCandidates: Math.max(100, boundedLimit * 20),
    limit: boundedLimit,
  };
  if (filter) vectorStage.filter = filter;

  try {
    const chunks = await DocumentChunk.aggregate([
      { $vectorSearch: vectorStage },
      { $project: { _id: 1, content: 1, documentName: 1, category: 1, planTier: 1, score: { $meta: "vectorSearchScore" } } },
    ]);
    console.log("Retrieved chunks count:", chunks.length);
    return chunks;
  } catch (error) {
    console.error("CHAT_ERROR_DETAIL:", error);
    if (/index|vector.?search|not found|does not exist/i.test(error.message || "")) {
      const indexError = new Error('Atlas Vector Search index "vector_index" is missing or unavailable. Create the configured index and retry.');
      indexError.statusCode = 503;
      indexError.isOperational = true;
      indexError.cause = error;
      throw indexError;
    }
    throw error;
  }
}
