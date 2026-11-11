import mongoose from "mongoose";

const documentChunkSchema = new mongoose.Schema(
  {
    documentName: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, trim: true, lowercase: true, index: true },
    planTier: { type: String, required: true, trim: true, index: true },
    content: { type: String, required: true },
    embedding: { type: [Number], required: true, select: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

documentChunkSchema.index({ documentName: 1, category: 1, planTier: 1 });

export default mongoose.models.DocumentChunk ||
  mongoose.model("DocumentChunk", documentChunkSchema);
