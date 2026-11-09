import express from "express";
import { protect, restrictTo } from "../middlewares/protect.js";
import { handleValidation } from "../utils/handleValidation.js";
import { ROLES } from "../constants/roles.js";

import {
  createPlanController,
  updatePlanController,
  deletePlanController,
  listPlansAdminController,
  listPlansPublicController,
  getPremiumStatsController,
  getPlanByIdController,
  getPopularPlansController,
  previewRiskController,
} from "../controllers/planController.js";

import {
  createPlanValidator,
  updatePlanValidator,
  filterPlansValidator,
} from "../validators/insurancePlanValidator.js";

const router = express.Router();

/* ======================================================
   PUBLIC ROUTES
====================================================== */

// 1️⃣ List all published plans
router.get(
  "/",
  filterPlansValidator,
  handleValidation,
  listPlansPublicController
);

// 2️⃣ Get popular plans
router.get("/popular", getPopularPlansController);

// 3️⃣ Get premium statistics
router.get("/stats/premium", getPremiumStatsController);

// 4️⃣ Get single plan by ID (use /id/:id to avoid collisions)
router.get("/id/:id", getPlanByIdController);

/* ======================================================
   ADMIN ROUTES (all require authentication)
====================================================== */
router.use(protect);

// 1️⃣ List all plans (admin) with filters
router.get(
  "/admin",
  restrictTo(ROLES.ADMIN),
  filterPlansValidator,
  handleValidation,
  listPlansAdminController
);

// 2️⃣ Create a new plan
router.post(
  "/",
  restrictTo(ROLES.ADMIN),
  createPlanValidator,
  handleValidation,
  createPlanController
);

// 3️⃣ Update an existing plan
router.patch(
  "/:id",
  restrictTo(ROLES.ADMIN),
  updatePlanValidator,
  handleValidation,
  updatePlanController
);
router.post("/risk-score", restrictTo(ROLES.ADMIN), previewRiskController);
// 4️⃣ Soft delete a plan
router.delete("/:id", restrictTo(ROLES.ADMIN), deletePlanController);

export default router;
