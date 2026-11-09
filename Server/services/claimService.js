import Claim from "../models/claim.js";
import Policy from "../models/policy.js";
import AppError from "../utils/AppError.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import NotificationService from "./notificationService.js"; // <-- for creating notifications
import mongoose from "mongoose"; // Required for isValidObjectId check

class ClaimService {
  // ---------------------------
  // Existing methods
  // ---------------------------

  async createClaim(data, userId, documentUrl) {
    // 1. Find the policy by ID OR by Policy Number
    const isId = mongoose.isValidObjectId(data.policyId);

    const policy = await Policy.findOne({
      $and: [
        {
          $or: [
            { _id: isId ? data.policyId : null },
            { policyNumber: data.policyId },
          ],
        },
        { userId: userId }, // Security: Must belong to the logged-in user
        { isDeleted: false },
      ],
    });

    if (!policy) {
      throw new AppError(
        "Policy not found, unauthorized, or has been deleted.",
        404
      );
    }

    // 2. Generate unique claim number
    const claimNumber = `CLM-${crypto.randomBytes(6).toString("hex")}`;

    // 3. Create the claim
    const claim = await Claim.create({
      // Fields from the Frontend request
      claimType: data.claimType,
      amount: data.amount,
      reason: data.description || data.reason,
      description: data.description,

      // FIX: Map the documentUrl passed from the controller
      documentUrl: documentUrl || data.documentUrl,

      // Fields from the Policy (Source of Truth)
      policyId: policy._id,
      policyNumber: policy.policyNumber,
      user: userId,

      // System generated fields
      claimNumber,
      createdBy: userId,
    });

    return claim;
  }
  async getMyClaims(userId, query = {}) {
    const { page = 1, limit = 10, status, search } = query;

    // 1. Build a dynamic filter object
    const filter = { user: userId };

    // Filter by status if provided (e.g., 'pending', 'approved')
    if (status) {
      filter.status = status;
    }

    // Basic search functionality (e.g., searching by claim title or description)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // 2. Execute query with pagination
    const skip = (page - 1) * limit;

    const [claims, totalCount] = await Promise.all([
      Claim.find(filter)
        .populate("user", "fullName email")
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Claim.countDocuments(filter),
    ]);

    return {
      claims,
      meta: {
        totalCount,
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: skip + claims.length < totalCount,
      },
    };
  }
  async getClaimById(id, userId) {
    const claim = await Claim.findOne({ _id: id, isDeleted: false })
      .populate("policyId")
      .populate("userId");

    if (!claim) throw new AppError("Claim not found", 404);
    if (claim.userId._id.toString() !== userId)
      throw new AppError("Unauthorized", 403);

    return claim;
  }

  // service.js
  async listAllClaims({ page = 1, limit = 10, search = "" }) {
    const skip = (page - 1) * limit;

    // 1. Define the filter
    let query = {};

    if (search) {
      query = {
        $or: [
          { policyNumber: { $regex: search, $options: "i" } },
          { claimType: { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
        ],
      };
    }

    // 2. Execute query with filter
    const claims = await Claim.find(query)
      .populate("user")
      .skip(skip)
      .limit(limit)
      .sort({ submittedAt: -1 });

    // 3. Count only the documents that match the search
    const total = await Claim.countDocuments(query);

    return {
      claims,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(id, status, adminId) {
    // Find and update claim
    const claim = await Claim.findOneAndUpdate(
      { _id: id }, // removed isDeleted
      { status, updatedBy: adminId }, // optional, add field to schema
      { new: true }
    ).populate("user"); // correct field

    if (!claim) throw new AppError("Claim not found", 404);

    try {
      const subject = `Your claim ${claim.policyNumber} status has been updated`;
      const text = `Hello ${
        claim.user.fullName || "User"
      },\n\nYour claim status has been updated to "${status}".\n\nThank you.`;

      await sendEmail({
        email: claim.user.email,
        subject,
        text,
      });
    } catch (err) {
      console.error("Error sending status email:", err);
    }

    return claim;
  }

  async softDeleteClaim(id, adminId) {
    const claim = await Claim.findByIdAndUpdate(
      id,
      { isDeleted: true, updatedBy: adminId },
      { new: true }
    );

    if (!claim) throw new AppError("Claim not found", 404);
    return claim;
  }

  // ---------------------------
  // NEW: Send Reminders for Pending Claims
  // ---------------------------
  async sendClaimReminders(daysPending = 3) {
    // Find claims that are pending for more than X days
    const pendingClaims = await Claim.find({
      status: "pending",
      isDeleted: false,
      createdAt: {
        $lte: new Date(Date.now() - daysPending * 24 * 60 * 60 * 1000),
      },
    }).populate("userId");

    for (const claim of pendingClaims) {
      if (!claim.userId) continue;

      // Create notification
      await NotificationService.createNotification({
        userId: claim.userId._id,
        title: "Pending Claim Reminder",
        message: `Your claim ${claim.claimNumber} is still pending. Please submit any required documents.`,
      });

      // Optional: send email
      try {
        const subject = `Reminder: Pending Claim ${claim.claimNumber}`;
        const text = `Hello ${claim.userId.fullName},\n\nYour claim is still pending. Please submit required documents.\n\nThank you.`;
        await sendEmail({
          email: claim.userId.email,
          subject,
          text,
        });
      } catch (err) {
        console.error("Error sending reminder email:", err);
      }
    }

    return pendingClaims.length; // return number of reminders sent
  }
}

export default new ClaimService();
