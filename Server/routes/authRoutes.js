import { Router } from "express";
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  changePassword,
  getMe,
} from "../controllers/authController.js";

import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
} from "../validators/authValidator.js";

import validate from "../middlewares/validateMiddleware.js";
import { authLimiter } from "../middlewares/rateLimit.js";
import { protect } from "../middlewares/protect.js";

const router = Router();

// ================== PUBLIC ROUTES ==================

// Register
router.post("/register", authLimiter, registerValidator, validate, register);

// Login
router.post("/login", authLimiter, loginValidator, validate, login);

// Logout (simple, no refresh tokens)
router.post("/logout", logout);

// Forgot-password
router.post(
  "/forgot-password",
  authLimiter,
  forgotPasswordValidator,
  validate,
  forgotPassword
);

// Reset password
router.put(
  "/reset-password/:token",
  resetPasswordValidator,
  validate,
  resetPassword
);
router.get("/me", protect, getMe);
// Verify email
router.get("/verify-email/:token", verifyEmail);

// Resend email verification (requires login)
router.post("/resend-verification", protect, resendVerification);

// ================== PROTECTED ROUTES ==================

// Change password
router.put(
  "/change-password",
  protect,
  changePasswordValidator,
  validate,
  changePassword
);

export default router;
