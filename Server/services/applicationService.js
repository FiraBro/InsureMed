import Application from "../models/application.js";
import Policy from "../models/policy.js";
import { validatePlan, validateDates } from "../utils/validation.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";
import crypto from "crypto";

import InsurancePlan from "../models/plan.js"; // ✅ FIXED

class ApplicationService {
  // ==================================================
  // USER: APPLY FOR A POLICY
  // ==================================================
  async apply(data, userId) {
    // Validate plan
    const plan = await validatePlan(data.planId);

    // Check for existing active policy
    const existingPolicy = await Policy.findOne({
      userId,
      planId: plan._id,
      status: "active",
      isDeleted: false,
    });
    if (existingPolicy)
      throw new AppError(
        "You already have an active policy for this plan",
        400
      );

    // Create application with full formData
    const application = await Application.create({
      userId,
      planId: plan._id,
      personal: data.personal || {},
      nominee: data.nominee || {},
      medical: data.medical || {},
      payment: data.payment || {},
      agree: data.agree || false,
      documents: data.documents || [], // files
      createdBy: userId,
      status: "pending",
    });

    return application;
  }

  // ==================================================
  // ADMIN: APPROVE APPLICATION
  // ==================================================

  async approve(id, adminId) {
    try {
      // 1. Fetch the Application
      const app = await Application.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!app) throw new AppError("Application not found", 404);
      if (app.status !== "pending")
        throw new AppError("Only pending applications can be approved", 400);

      // 2. Load Plan Data
      const planData = await Plan.findById(app.planId);
      if (!planData) throw new AppError("Plan not found", 404);

      // 3. Check for existing active policy
      const existingPolicy = await Policy.findOne({
        userId: app.userId,
        planId: app.planId,
        status: "active",
        isDeleted: false,
      });

      if (existingPolicy)
        throw new AppError(
          "User already has an active policy for this plan",
          400
        );

      // 4. Date Calculations
      const startDate = new Date();
      const endDate = new Date();
      const durationMonths = planData.validityPeriod
        ? planData.validityPeriod / 30
        : 12;
      endDate.setMonth(endDate.getMonth() + durationMonths);

      // 5. Update Application
      app.status = "approved";
      app.startDate = startDate;
      app.endDate = endDate;
      app.updatedBy = adminId;
      await app.save();

      // 6. Create Policy
      // Note: Without session, we can pass a simple object to .create()
      const newPolicy = await Policy.create({
        userId: app.userId,
        planId: app.planId,
        startDate,
        endDate,
        premium: planData.premium,
        coverageAmount: planData.coverageAmount,
        status: "active",
        policyNumber: `POL-${crypto.randomBytes(6).toString("hex")}`,
        createdBy: adminId,
      });

      return { application: app, policy: newPolicy };
    } catch (err) {
      // No abortTransaction needed here
      throw err;
    }
  }

  // ==================================================
  // ADMIN: REJECT APPLICATION
  // ==================================================
  async reject(id, reason, adminId) {
    const app = await Application.findOne({ _id: id, isDeleted: false });
    if (!app) throw new AppError("Application not found", 404);

    app.status = "rejected";
    app.rejectionReason = reason || "No reason provided";
    app.updatedBy = adminId;

    await app.save();
    return app;
  }

  // USER: GET MY APPLICATIONS (Optimized)
  // ==================================================
  async getMyApplications(
    userId,
    { status = "", page = 1, limit = 10, search = "" } = {}
  ) {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 1. Base filter MUST always be applied
    const filter = { userId, isDeleted: false };

    // 2. Handle Status Tab Filter
    if (status && status !== "all") {
      filter.status = status;
    }

    // 3. Handle Search Filter (FIXED LOGIC)
    if (search && search.trim() !== "") {
      const matchingPlans = await InsurancePlan.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

      const planIds = matchingPlans.map((p) => p._id);

      // FIX: Wrap search in an $and with the existing filter
      // or simply add the $or to the existing filter object carefully.
      filter.$or = [
        { "personal.fullName": { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
        { planId: { $in: planIds } },
      ];
    }

    // 4. Parallel Execution (Remains the same)
    const [applications, totalCount, countsArray] = await Promise.all([
      Application.find(filter) // This now correctly requires (User AND Search)
        .populate("planId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),

      Application.countDocuments(filter),

      Application.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            isDeleted: false,
          },
        },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const counts = countsArray.reduce(
      (acc, curr) => {
        acc[curr._id] = curr.count;
        acc.all = (acc.all || 0) + curr.count;
        return acc;
      },
      { all: 0, pending: 0, approved: 0, rejected: 0 }
    );

    return {
      status: "success",
      applications,
      counts,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        limit: parseInt(limit),
      },
    };
  }

  // ==================================================
  // ADMIN: LIST APPLICATIONS
  // ==================================================
  async list({ page = 1, limit = 10, search = "" }) {
    const skip = (page - 1) * limit;

    // 1. Build the filter object
    let filter = { isDeleted: false };

    // 2. Add search logic if a search term exists
    if (search) {
      filter.$or = [
        { "personal.fullName": { $regex: search, $options: "i" } },
        { "personal.email": { $regex: search, $options: "i" } },
      ];
    }

    // 3. Execute query
    const applications = await Application.find(filter)
      .populate("userId")
      .populate("planId")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // 4. Count based on the SAME filter
    const total = await Application.countDocuments(filter);

    return {
      applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ==================================================
  // ADMIN: SOFT DELETE APPLICATION
  // ==================================================
  async softDelete(id, adminId) {
    const app = await Application.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, updatedBy: adminId },
      { new: true }
    );

    if (!app) throw new AppError("Application not found", 404);
    return app;
  }
}

export default new ApplicationService();
