import mongoose from "mongoose";

const policySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    // Unique Policy Number
    policyNumber: { type: String, unique: true, required: true },

    // Status
    status: {
      type: String,
      enum: ["active", "expired", "pending_renewal", "renewed", "cancelled"],
      default: "active",
    },
    // Dates
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    // Financial info (important!)
    premium: { type: Number, required: true },
    currency: { type: String, default: "USD" }, // or ETB

    // Plan snapshot (frozen at purchase time)
    planSnapshot: {
      name: String,
      coverageAmount: Number,
      planType: String,
    },

    // Renewal info
    renewalCount: { type: Number, default: 0 },
    lastRenewedAt: { type: Date },

    // Cancellation info
    cancellationReason: { type: String },
    cancelledAt: { type: Date },

    // Soft delete
    isDeleted: { type: Boolean, default: false },

    // Audit fields
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// ---- Indexes for performance ----
policySchema.index({ policyNumber: 1 }, { unique: true });
policySchema.index({ userId: 1 });
policySchema.index({ planId: 1 });
policySchema.index({ status: 1 });
policySchema.index({ endDate: 1 });
policySchema.index({ isDeleted: 1 });

export default mongoose.model("Policy", policySchema);
