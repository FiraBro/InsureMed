import express from "express";
import * as claimController from "../controllers/claimController.js";
import { protect, restrictTo } from "../middlewares/protect.js";
import { ROLES } from "../constants/roles.js";
import upload from "../middlewares/upload.js"; // your existing file upload middleware
import {
  createClaimValidator,
  updateClaimStatusValidator,
  claimPaginationValidator,
  validate,
} from "../validators/claimValidator.js";

const router = express.Router();

// ----------------------
// User Endpoints
// ----------------------

// Create new claim with file upload & validation
router.post(
  "/create",
  protect,
  upload.single("document"), // use your middleware here
  createClaimValidator,
  validate,
  claimController.createClaim
);

// Get logged-in user's claims
router.get("/me", protect, claimController.getMyClaims);

// Get a specific claim by ID (user can only access own claims)
router.get("/:id", protect, claimController.getClaimById);

// ----------------------
// Admin Endpoints
// ----------------------

// List all claims with pagination & search
router.get(
  "/",
  protect,
  restrictTo(ROLES.ADMIN),
  claimPaginationValidator,
  validate,
  claimController.listAllClaims
);

// Update claim status
router.put(
  "/:id/status",
  protect,
  restrictTo(ROLES.ADMIN),
  updateClaimStatusValidator,
  validate,
  claimController.updateStatus
);

// Soft-delete a claim
router.delete(
  "/:id",
  protect,
  restrictTo(ROLES.ADMIN),
  claimController.softDeleteClaim
);

export default router;
