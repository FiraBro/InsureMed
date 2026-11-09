import express from "express";
import { protect, restrictTo } from "../middlewares/protect.js";
import { ROLES } from "../constants/roles.js";

import {
  getMyPolicies,
  getPolicyById,
  listPolicies,
  updatePolicyStatus,
  requestPolicyRenewal, // user requests renewal
  approvePolicyRenewal, // admin approves renewal
  cancelPolicy,
  deletePolicy,
} from "../controllers/policyController.js";

import {
  updateStatusValidator,
  paginationValidator,
  requestRenewalValidator,
} from "../validators/policyValidator.js";

import { handleValidation } from "../utils/handleValidation.js";

const router = express.Router();

// ======================
// USER ROUTES
// ======================
router.get("/my", protect, getMyPolicies);

// User requests renewal (bank transfer)
router.post(
  "/:id/renew",
  protect,
  requestRenewalValidator,
  handleValidation,
  requestPolicyRenewal
);

// ======================
// ADMIN ROUTES
// ======================
router.get(
  "/",
  protect,
  restrictTo(ROLES.ADMIN),
  paginationValidator,
  handleValidation,
  listPolicies
);

router.get("/:id", protect, restrictTo(ROLES.ADMIN), getPolicyById);

router.put(
  "/:id/status",
  protect,
  restrictTo(ROLES.ADMIN),
  updateStatusValidator,
  handleValidation,
  updatePolicyStatus
);

// Admin approves pending renewal
router.post(
  "/:id/renew/approve",
  protect,
  restrictTo(ROLES.ADMIN),
  approvePolicyRenewal
);

router.put("/:id/cancel", protect, restrictTo(ROLES.ADMIN), cancelPolicy);

router.delete("/:id", protect, restrictTo(ROLES.ADMIN), deletePolicy);

export default router;
