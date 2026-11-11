import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_DIMENSIONS = 768;
const MAX_BATCH_SIZE = 100;

function getEmbeddingModel() {
  if (!process.env.GEMINI_API_KEY) {
    const error = new Error("GEMINI_API_KEY is not configured.");
    error.statusCode = 503;
    error.isOperational = true;
    throw error;
  }
  const cleanModelName = (process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001").replace(/^models\//, "");
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({ model: cleanModelName });
}

function annotateGeminiError(error) {
  const status = error?.status || error?.statusCode;
  if (status === 429 || /rate.?limit|quota/i.test(error?.message || "")) {
    error.statusCode = 503;
    error.isOperational = true;
    error.message = "Gemini rate limit reached. Retry the request shortly.";
  }
  return error;
}

function embeddingRequest(text, taskType) {
  const dimensions = Number(process.env.GEMINI_EMBEDDING_DIMENSIONS || DEFAULT_DIMENSIONS);
  if (dimensions !== DEFAULT_DIMENSIONS) {
    throw new Error(`GEMINI_EMBEDDING_DIMENSIONS must be ${DEFAULT_DIMENSIONS} to match the Atlas vector index.`);
  }
  return {
    content: { parts: [{ text }] },
    taskType,
    outputDimensionality: dimensions,
  };
}

export async function embedTexts(texts, { taskType = "RETRIEVAL_DOCUMENT" } = {}) {
  if (!Array.isArray(texts) || texts.some((text) => typeof text !== "string" || !text.trim())) {
    throw new TypeError("embedTexts expects an array of non-empty strings.");
  }
  if (texts.length === 0) return [];

  const model = getEmbeddingModel();
  const vectors = [];
  try {
    for (let offset = 0; offset < texts.length; offset += MAX_BATCH_SIZE) {
      const batch = texts.slice(offset, offset + MAX_BATCH_SIZE);
      const result = await model.batchEmbedContents({
        requests: batch.map((text) => embeddingRequest(text, taskType)),
      });
      const batchVectors = result.embeddings?.map((entry) => entry.values) || [];
      if (batchVectors.length !== batch.length || batchVectors.some((vector) => vector?.length !== DEFAULT_DIMENSIONS)) {
        throw new Error(`Gemini must return ${DEFAULT_DIMENSIONS}-dimension embeddings to match the Atlas vector index.`);
      }
      vectors.push(...batchVectors);
    }
    return vectors;
  } catch (error) {
    console.error("CHAT_ERROR_DETAIL:", error);
    throw annotateGeminiError(error);
  }
}

export async function embedQuery(text) {
  if (typeof text !== "string" || !text.trim()) throw new TypeError("Query text is required.");
  return (await embedTexts([text], { taskType: "RETRIEVAL_QUERY" }))[0];
}
