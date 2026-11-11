import dotenv from "dotenv";
import mongoose from "mongoose";
import { ingestDocument } from "../services/rag.service.js";

dotenv.config();

const [filePath, documentName, category, planTier] = process.argv.slice(2);
if (!filePath || !documentName || !category || !planTier) {
  console.error("Usage: node scripts/ingest-document.js <filePath> <documentName> <category> <planTier>");
  process.exitCode = 2;
} else {
  try {
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not configured.");
    await mongoose.connect(process.env.MONGODB_URI);
    const result = await ingestDocument(filePath, documentName, category, planTier);
    console.log(`Inserted ${result.insertedCount} chunks for ${result.documentName}.`);
  } catch (error) {
    console.error(`Document ingestion failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
