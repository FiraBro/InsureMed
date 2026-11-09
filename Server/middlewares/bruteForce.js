// middleware/bruteForce.js
import User from "../models/user.js";
import AppError from "../utils/AppError.js";

export const bruteForceProtection = async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next();

  const existingUser = await User.findOne({ email }).select(
    "+failedLoginAttempts +lockUntil"
  );
  if (!existingUser) return next();

  // If account is locked
  if (existingUser.lockUntil && existingUser.lockUntil > Date.now()) {
    return next(
      new AppError(
        "Account temporarily locked due to many failed attempts.",
        423
      )
    );
  }

  next();
};
