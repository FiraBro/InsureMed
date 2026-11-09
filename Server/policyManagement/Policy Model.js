import mongoose from "mongoose";

const policySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // health, life, car etc.
  premium: { type: Number, required: true },
  durationMonths: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who bought it
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ["active", "expired"], default: "active" },
}, { timestamps: true });

export default mongoose.model("Policy", policySchema);
