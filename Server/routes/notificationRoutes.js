import express from "express";
import { protect, restrictTo } from "../middlewares/protect.js";
import {
  getMyNotifications,
  markAsRead,
  createNotificationController,
} from "../controllers/notificationController.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

// ========== User Routes ==========
router.use(protect); // All routes below require login

router.get("/", getMyNotifications);
router.patch("/:id/read", markAsRead);

// ========== Admin Only ==========
router.post("/", restrictTo(ROLES.ADMIN), createNotificationController);

export default router;
