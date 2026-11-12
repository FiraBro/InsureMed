import express from "express";
import { getAdminOverview, getUserOverview } from "../controllers/dashboardController.js";
import { protect, restrictTo } from "../middlewares/protect.js";
import { ROLES } from "../constants/roles.js";
const router = express.Router();

router.get("/", protect, getUserOverview);

// Professional insurance dashboards must be restricted to Admin/Management
router.get(
  "/admin/overview",
  protect,
  restrictTo(ROLES.ADMIN),
  getAdminOverview
);

export default router;
