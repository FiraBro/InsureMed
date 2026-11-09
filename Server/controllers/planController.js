import catchAsync from "../utils/catchAsync.js";
import InsurancePlanService from "../services/PlanService.js";

// ---------------------------
// CREATE PLAN
// ---------------------------
export const createPlanController = catchAsync(async (req, res) => {
  const plan = await InsurancePlanService.createPlan(req.body, req.user.id);
  res.status(201).json({ status: "success", data: plan });
});

// ---------------------------
// UPDATE PLAN
// ---------------------------
export const updatePlanController = catchAsync(async (req, res) => {
  const plan = await InsurancePlanService.updatePlan(
    req.params.id,
    req.body,
    req.user.id
  );
  res.json({ status: "success", data: plan });
});

// ---------------------------
// GET PLAN BY ID
// ---------------------------
export const getPlanByIdController = catchAsync(async (req, res) => {
  const plan = await InsurancePlanService.getPlanById(req.params.id);
  res.status(200).json({ status: "success", data: plan });
});

// ---------------------------
// SOFT DELETE PLAN
// ---------------------------
export const deletePlanController = catchAsync(async (req, res) => {
  const plan = await InsurancePlanService.softDeletePlan(req.params.id);
  res.json({ status: "success", data: plan });
});

// ---------------------------
// LIST PLANS ADMIN
// ---------------------------
export const listPlansAdminController = catchAsync(async (req, res) => {
  const result = await InsurancePlanService.listPlansAdmin(req.query);
  res.json({ status: "success", ...result });
});

// ---------------------------
// LIST PUBLIC PLANS
// ---------------------------
export const listPlansPublicController = catchAsync(async (req, res) => {
  const plans = await InsurancePlanService.listPlansPublic(req.query);
  res.json({ status: "success", data: plans });
});

// ---------------------------
// PREMIUM STATISTICS
// ---------------------------
export const getPremiumStatsController = catchAsync(async (req, res) => {
  const stats = await InsurancePlanService.getPremiumStats();
  res.json({ status: "success", data: stats });
});

// ---------------------------
// POPULAR PLANS
// ---------------------------
export const getPopularPlansController = catchAsync(async (req, res) => {
  const plans = await InsurancePlanService.getPopularPlans();
  res.status(200).json({ status: "success", data: plans });
});

// ---------------------------
// AI RISK SCORE PREVIEW
// ---------------------------
export const previewRiskController = catchAsync(async (req, res) => {
  const planData = req.body;

  const result =
    InsurancePlanService.calculateRiskScoreWithRecommendations(planData);

  res.status(200).json({
    status: "success",
    data: result,
  });
});
