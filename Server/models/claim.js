import mongoose from "mongoose";
const claimSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  policyNumber: { type: String, required: true },
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: "Policy" }, // Added to match service
  reason: { type: String, required: true },
  claimType: { type: String, required: true },
  amount: { type: Number },
  documentUrl: { type: String }, // Your service uses 'documentUrl', schema used 'document'
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"], // Ensure service sends capitalized strings
    default: "Pending",
  },
  isDeleted: { type: Boolean, default: false }, // Added this to fix the "Not Found" error
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("Claim", claimSchema);
