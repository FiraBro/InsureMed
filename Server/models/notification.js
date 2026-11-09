import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
    },
    // Changed "type" to "category" to match your Service Logic (claim, policy, etc.)
    category: {
      type: String,
      enum: ["claim", "policy", "payment", "analytics"],
      required: true,
    },
    // Added priority for the "Immediate Email" logic
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    // Match the frontend property name
    isRead: {
      type: Boolean,
      default: false,
    },
    // IMPORTANT: Added metadata to store {id, reason, policyName}
    metadata: {
      type: Object,
      default: {},
    },
    sentAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, status: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
