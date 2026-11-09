import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    systemName: { type: String, default: "InsuTrack Pro" },
    contactEmail: { type: String, default: "admin@insutrack.com" },
    currency: { type: String, default: "USD" },

    // Financial Configuration
    globalTaxRate: { type: Number, default: 15 }, // in percentage
    renewalGracePeriod: { type: Number, default: 30 }, // in days

    // Security/Operational Toggles
    maintenanceMode: { type: Boolean, default: false },
    autoApproveClaimsUnder: { type: Number, default: 0 }, // 0 means manual only

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);
