import Policy from "../models/policy.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

/**
 * View all available policies
 * GET /api/v1/policies
 */
export const viewPolicies = catchAsync(async (req, res, next) => {
  const policies = await Policy.find({ userId: null }).lean();
  res.status(200).json({ status: "success", data: policies });
});

/**
 * Buy/Enroll a policy
 * POST /api/v1/policies/:id/buy
 */
export const buyPolicy = catchAsync(async (req, res, next) => {
  const policy = await Policy.findById(req.params.id);
  if (!policy) return next(new AppError("Policy not found", 404));

  policy.userId = req.user.id;
  policy.startDate = new Date();
  policy.endDate = new Date(new Date().setMonth(new Date().getMonth() + policy.durationMonths));
  await policy.save();

  res.status(200).json({ status: "success", data: policy });
});

/**
 * Renew policy
 * PATCH /api/v1/policies/:id/renew
 */
export const renewPolicy = catchAsync(async (req, res, next) => {
  const policy = await Policy.findOne({ _id: req.params.id, userId: req.user.id });
  if (!policy) return next(new AppError("Policy not found", 404));

  policy.endDate = new Date(new Date().setMonth(new Date().getMonth() + policy.durationMonths));
  policy.status = "active";
  await policy.save();

  res.status(200).json({ status: "success", data: policy });
});

/**
 * Policy history
 * GET /api/v1/policies/history
 */
export const policyHistory = catchAsync(async (req, res, next) => {
  const policies = await Policy.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
  res.status(200).json({ status: "success", data: policies });
});
