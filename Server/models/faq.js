import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: false, trim: true },
    answer: { type: String, required: false },
    category: {
      type: String,
      enum: ["GENERAL", "PAYMENT", "CLAIM", "POLICY"],
      default: "GENERAL",
    },
    embedding: [Number], // The 1536-dimension vector from OpenAI
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("FAQ", faqSchema);
