import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
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

    // Personal info
    personal: {
      fullName: { type: String },
      email: { type: String },
      phone: { type: String },
      dob: { type: Date },
      address: { type: String }, // optional if you want
    },

    // Nominee info
    nominee: {
      name: { type: String },
      relationship: { type: String },
    },

    // Medical info
    medical: {
      history: { type: String },
      otherDetails: { type: String }, // optional extra info
    },

    // Uploaded documents
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Payment info
    payment: {
      frequency: { type: String, default: "monthly" },
      method: { type: String, default: "online" },
    },

    // Terms agreement
    agree: { type: Boolean, default: false },

    // Status & admin
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    startDate: { type: Date },
    endDate: { type: Date },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Application", applicationSchema);
