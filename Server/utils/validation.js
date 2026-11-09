import Plan from "../models/plan.js";
import AppError from "./AppError.js";

export async function validatePlan(planId) {
  const plan = await Plan.findOne({
    _id: planId,
    isDeleted: false,
    status: "published",
  });
  if (!plan) throw new AppError("Insurance plan not found", 404);
  return plan;
}

export function validateDates(startDate, endDate) {
  if (new Date(endDate) <= new Date(startDate)) {
    throw new AppError("End date must be after start date", 400);
  }
}
