import express from "express";
import {
  getAdminAnalytics,
  handleGlobalSearch,
} from "../controllers/analyticController.js";
import {
  getSettings,
  updateSettings,
} from "../controllers/settingController.js";
import { protect, restrictTo } from "../middlewares/protect.js";
import { ROLES } from "../constants/roles.js";
const router = express.Router();

// PROTECT ALL ADMIN ROUTES
router.get("/settings", getSettings);

router.use(protect, restrictTo(ROLES.ADMIN));

// Analytics
router.get("/analytics/financials", getAdminAnalytics);
router.get("/global/search", handleGlobalSearch);
router.patch("/settings", updateSettings);

export default router;
