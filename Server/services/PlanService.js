import mongoose from "mongoose";
import slugify from "slugify";
import InsurancePlan from "../models/plan.js";
import Policy from "../models/policy.js";
import AppError from "../utils/AppError.js";
import { PLAN_TYPES } from "../constants/planTypes.js"; // ✅ import plan types

class InsurancePlanService {
  // ---------------------------
  // PRIVATE: Risk Score Calculator
  // ---------------------------
  #calculateRiskScore(plan) {
    let score = 0;

    // Coverage contribution
    score += Math.min(50, plan.coverageAmount / 1000);

    // Deductible contribution
    score += plan.deductible < 500 ? 10 : 0;

    // Age eligibility
    if (plan.minAge < 25) score += 10;
    if (plan.maxAge > 60) score += 5;

    // Max members
    score += Math.min(20, plan.maxMembers * 2);

    // Features / Exclusions
    if (plan.features?.length > 5) score += 5;
    if (plan.exclusions?.length < 2) score += 5;

    return Math.min(100, Math.round(score));
  }

  // ---------------------------
  // Public: Only risk score
  // ---------------------------
  calculateRiskScoreForPreview(plan) {
    return this.#calculateRiskScore(plan);
  }

  // ---------------------------
  // Public: Extended risk score with recommendations
  // ---------------------------
  calculateRiskScoreWithRecommendations(plan) {
    const recommendations = [];
    let score = 0;

    // Coverage contribution
    score += Math.min(50, plan.coverageAmount / 1000);
    if (plan.coverageAmount > 5000000)
      recommendations.push("Consider reducing coverage amount to lower risk");

    // Deductible contribution
    if (plan.deductible < 500) {
      score += 10;
      recommendations.push("Increase deductible to 500+ to reduce risk");
    }

    // Age eligibility
    if (plan.minAge < 25) {
      score += 10;
      recommendations.push("Avoid including very young members to reduce risk");
    }
    if (plan.maxAge > 60) {
      score += 5;
      recommendations.push(
        "Avoid including very senior members to reduce risk"
      );
    }

    // Max members
    score += Math.min(20, plan.maxMembers * 2);
    if (plan.maxMembers > 5)
      recommendations.push("Limit number of members per plan");

    // Features / Exclusions
    if (plan.features?.length <= 5)
      recommendations.push("Add more key features to reduce risk");
    if (plan.exclusions?.length < 2)
      recommendations.push("Add more exclusions to clearly define limits");

    return {
      riskScore: Math.min(100, Math.round(score)),
      recommendations,
    };
  }

  // ---------------------------
  // CREATE PLAN
  async createPlan(data, userId) {
    const slug = slugify(data.name, { lower: true });

    const exists = await InsurancePlan.findOne({
      slug,
      isDeleted: false,
    }).lean();
    if (exists) throw new AppError("Plan name already exists", 400);

    // ✅ Validate planType
    if (data.planType && !Object.values(PLAN_TYPES).includes(data.planType)) {
      throw new AppError("Invalid plan type", 400);
    }

    // ✅ Calculate AI Risk Score with recommendations
    const riskScoreObj = this.calculateRiskScoreWithRecommendations(data);

    // ✅ Ensure status is lowercase and valid
    const status = data.status?.toLowerCase() || "published";

    return await InsurancePlan.create({
      ...data,
      slug,
      status,
      riskScore: {
        score: riskScoreObj.riskScore,
        recommendations: riskScoreObj.recommendations || [],
      },
      createdBy: userId,
    });
  }

  // ---------------------------
  // UPDATE PLAN
  // ---------------------------
  async updatePlan(id, data, userId) {
    if (data.name) data.slug = slugify(data.name, { lower: true });

    if (data.planType && !Object.values(PLAN_TYPES).includes(data.planType)) {
      throw new AppError("Invalid plan type", 400);
    }

    const riskScore = this.#calculateRiskScore(data);

    const plan = await InsurancePlan.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { ...data, riskScore, updatedBy: userId },
      { new: true }
    ).lean();

    if (!plan) throw new AppError("Plan not found", 404);
    return plan;
  }

  // ---------------------------
  // GET PLAN BY ID
  // ---------------------------
  async getPlanById(id) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new AppError("Invalid plan ID", 400);

    const plan = await InsurancePlan.findOne({
      _id: id,
      isDeleted: false,
    }).lean();
    if (!plan) throw new AppError("Plan not found", 404);

    return plan;
  }

  // ---------------------------
  // SOFT DELETE PLAN
  // ---------------------------
  async softDeletePlan(id) {
    const activePolicies = await Policy.countDocuments({
      planId: id,
      status: "approved",
    });
    if (activePolicies > 0)
      throw new AppError(
        "Cannot delete plan with active approved policies",
        400
      );

    const plan = await InsurancePlan.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    ).lean();
    if (!plan) throw new AppError("Plan not found", 404);

    return plan;
  }

  // ---------------------------
  // LIST PLANS (ADMIN)
  // ---------------------------
  async listPlansAdmin(filters) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
      planType,
      status,
      minPremium,
      maxPremium,
      search,
    } = filters;

    const skip = (page - 1) * limit;
    const query = { isDeleted: false };

    if (planType) query.planType = planType;
    if (status) query.status = status;

    if (minPremium || maxPremium) query.premium = {};
    if (minPremium) query.premium.$gte = parseFloat(minPremium);
    if (maxPremium) query.premium.$lte = parseFloat(maxPremium);

    if (search) query.name = { $regex: search, $options: "i" };

    const plans = await InsurancePlan.find(query)
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await InsurancePlan.countDocuments(query);

    return { plans, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ---------------------------
  // LIST PUBLIC PLANS
  // ---------------------------
  async listPlansPublic(filters = {}) {
    const { planType, minPremium, maxPremium, search } = filters;
    const query = { isDeleted: false, status: "published" };

    if (planType) query.planType = planType;

    if (minPremium || maxPremium) query.premium = {};
    if (minPremium) query.premium.$gte = parseFloat(minPremium);
    if (maxPremium) query.premium.$lte = parseFloat(maxPremium);

    if (search) query.name = { $regex: search, $options: "i" };

    return await InsurancePlan.find(query).lean();
  }

  // ---------------------------
  // PREMIUM STATISTICS
  // ---------------------------
  async getPremiumStats() {
    const result = await InsurancePlan.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalPremiums: { $sum: "$premium" },
          averagePremium: { $avg: "$premium" },
          minPremium: { $min: "$premium" },
          maxPremium: { $max: "$premium" },
          count: { $sum: 1 },
        },
      },
    ]);

    return (
      result[0] || {
        totalPremiums: 0,
        averagePremium: 0,
        minPremium: 0,
        maxPremium: 0,
        count: 0,
      }
    );
  }

  async getPopularPlans(limit = 4) {
    return await InsurancePlan.find({ status: "published", isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}

export default new InsurancePlanService();
