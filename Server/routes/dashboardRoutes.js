import express from "express";
import { getAdminOverview } from "../controllers/dashboardController.js";
import { protect, restrictTo } from "../middlewares/protect.js";
import { ROLES } from "../constants/roles.js";
const router = express.Router();

// Professional insurance dashboards must be restricted to Admin/Management
router.get(
  "/admin/overview",
  protect,
  restrictTo(ROLES.ADMIN),
  getAdminOverview
);

export default router;
