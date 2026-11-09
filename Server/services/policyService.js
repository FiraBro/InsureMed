import Policy from "../models/policy.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";
import InsurancePlan from "../models/plan.js";
class PolicyService {
  // ==================================================
  async getMyPolicies(userId, { page = 1, limit = 10, search = "" }) {
    const skip = (page - 1) * limit;

    // Ensure userId is handled correctly as a query filter
    let query = { userId: userId, isDeleted: false };

    if (search) {
      // FIX: Use the imported InsurancePlan model directly instead of mongoose.model()
      const matchingPlans = await InsurancePlan.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

      const planIds = matchingPlans.map((p) => p._id);

      // We use $and to ensure the userId and isDeleted filters are always respected
      query = {
        userId: userId,
        isDeleted: false,
        $or: [
          { "personal.fullName": { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
          { policyNumber: { $regex: search, $options: "i" } },
          { planId: { $in: planIds } },
        ],
      };
    }

    const [applications, totalRecords] = await Promise.all([
      Policy.find(query)
        .populate("planId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Policy.countDocuments(query),
    ]);

    return {
      applications,
      pagination: {
        total: totalRecords,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  }

  // ==================================================
  // USER: GET SINGLE POLICY
  // ==================================================
  async getPolicyById(id) {
    const policy = await Policy.findOne({ _id: id, isDeleted: false })
      .populate("userId")
      .populate("planId");

    if (!policy) throw new AppError("Policy not found", 404);
    return policy;
  }

  // ==================================================
  // ADMIN: LIST POLICIES
  // ==================================================
  async listPolicies({ page = 1, limit = 10, search = "", category = "" }) {
    const skip = (page - 1) * limit;

    // 1. Base Filter
    let filter = { isDeleted: false };

    // 2. Add Search Logic (Searching by Policy Number)
    if (search) {
      filter.$or = [
        { policyNumber: { $regex: search, $options: "i" } },
        // Note: If you want to search by User Name here,
        // you usually need to use Aggregation or search by ID
      ];
    }

    // 3. Add Category Logic
    // This assumes 'category' is a field on your Policy model.
    // If it's on the Plan model, you'll need to filter by planId first.
    if (category && category !== "All") {
      filter.category = category;
    }

    // 4. Execute Query
    const policies = await Policy.find(filter)
      .populate("userId", "fullName email") // Only fetch what we need
      .populate("planId", "name category")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Policy.countDocuments(filter);

    return {
      policies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ==================================================
  // ADMIN: UPDATE POLICY STATUS
  // ==================================================
  async updateStatus(id, status, adminId) {
    const allowed = [
      "active",
      "expired",
      "pending_renewal",
      "renewed",
      "cancelled",
    ];

    if (!allowed.includes(status)) {
      throw new AppError("Invalid status", 400);
    }

    const updated = await Policy.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { status, updatedBy: adminId },
      { new: true }
    );

    if (!updated) throw new AppError("Policy not found", 404);
    return updated;
  }

  // ==================================================
  // USER: REQUEST POLICY RENEWAL (BANK TRANSFER)
  // ==================================================
  async requestRenewal(policyId, userId, paymentReference) {
    const policy = await Policy.findById(policyId);

    if (!policy || policy.isDeleted) {
      throw new AppError("Policy not found", 404);
    }

    if (!["active", "expired"].includes(policy.status)) {
      throw new AppError("Policy not eligible for renewal", 400);
    }

    // Grace period: 30 days after expiry
    if (policy.status === "expired") {
      const daysExpired =
        (Date.now() - new Date(policy.endDate)) / (1000 * 60 * 60 * 24);

      if (daysExpired > 30) {
        throw new AppError("Renewal grace period expired", 400);
      }
    }

    // Prevent duplicate pending renewals
    const hasPending = policy.renewalHistory?.some(
      (r) => r.paymentStatus === "pending"
    );

    if (hasPending) {
      throw new AppError("A renewal request is already pending", 400);
    }

    // Calculate new end date (1 year extension)
    const newEndDate = new Date(policy.endDate);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);

    policy.renewalHistory = policy.renewalHistory || [];
    policy.renewalHistory.push({
      oldEndDate: policy.endDate,
      newEndDate,
      premium: policy.premium,
      paymentMethod: "bank_transfer",
      paymentStatus: "pending",
      paymentReference,
      requestedAt: new Date(),
    });

    policy.status = "pending_renewal";
    policy.updatedBy = userId;

    await policy.save();

    return {
      message: "Renewal request submitted. Awaiting payment verification.",
    };
  }

  // ==================================================
  // ADMIN: APPROVE RENEWAL (AFTER BANK VERIFICATION)
  // ==================================================
  async approveRenewal(policyId, adminId) {
    const policy = await Policy.findById(policyId);

    if (!policy || policy.isDeleted) {
      throw new AppError("Policy not found", 404);
    }

    const renewal = [...(policy.renewalHistory || [])]
      .reverse()
      .find((r) => r.paymentStatus === "pending");

    if (!renewal) {
      throw new AppError("No pending renewal found", 400);
    }

    renewal.paymentStatus = "verified";
    renewal.approvedAt = new Date();
    renewal.approvedBy = adminId;

    policy.endDate = renewal.newEndDate;
    policy.status = "active";
    policy.renewalCount = (policy.renewalCount || 0) + 1;
    policy.lastRenewedAt = new Date();
    policy.updatedBy = adminId;

    await policy.save();
    return policy;
  }

  // ==================================================
  // ADMIN: CANCEL POLICY
  // ==================================================
  async cancelPolicy(id, reason, adminId) {
    const policy = await Policy.findById(id);
    if (!policy || policy.isDeleted)
      throw new AppError("Policy not found", 404);

    policy.status = "cancelled";
    policy.cancellationReason = reason || "No reason provided";
    policy.cancelledAt = new Date();
    policy.updatedBy = adminId;

    await policy.save();
    return policy;
  }

  // ==================================================
  // ADMIN: SOFT DELETE POLICY
  // ==================================================
  async softDeletePolicy(id, adminId) {
    const deleted = await Policy.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, updatedBy: adminId },
      { new: true }
    );

    if (!deleted) throw new AppError("Policy not found", 404);
    return deleted;
  }
}

export default new PolicyService();
