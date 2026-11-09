import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  attachments: [{ type: String }], // URLs to S3/Cloudinary
  createdAt: { type: Date, default: Date.now },
});

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      uppercase: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: ["CLAIM", "PAYMENT", "POLICY", "ACCOUNT"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "EMERGENCY"],
      default: "LOW",
    },
    status: {
      type: String,
      enum: ["OPEN", "IN_REVIEW", "WAITING", "RESOLVED", "CLOSED"],
      default: "OPEN",
    },
    relatedPolicy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy", // Must match your Policy model name
    },
    relatedClaim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Claim", // Must match your Claim model name
    },
    userQuery: String,
    botDraft: String,
    isEscalated: { type: Boolean, default: false },
    slaDeadline: { type: Date }, // We set this during creation
    subject: { type: String, required: true, trim: true },
    messages: [messageSchema],
    attachments: [{ type: String }], // General ticket-level attachments
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate a human-readable ID (e.g., TIC-82731)
ticketSchema.pre("save", async function (next) {
  if (!this.ticketId) {
    this.ticketId = `TIC-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  next();
});

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
