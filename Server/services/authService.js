import AppError from "../utils/AppError.js";
import sendEmail from "../utils/sendEmail.js";
import User from "../models/user.js";
import { hashToken } from "../utils/hashToken.js";
import { signToken } from "../utils/jwt.js";

const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5");
const LOCK_TIME_MS = parseInt(process.env.LOCK_TIME_MS || `${15 * 60 * 1000}`);

// =============================== REGISTER ===============================
export const registerUser = async (data) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new AppError("Email already registered", 409);

  data.role = "customer";
  const newUser = await User.create(data);

  const verifyToken = newUser.createEmailVerifyToken();
  await newUser.save({ validateBeforeSave: false });

  const verifyURL = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;

  try {
    await sendEmail({
      email: newUser.email,
      subject: "Verify your email",
      text: `Verify here: ${verifyURL}`,
    });
  } catch (err) {
    console.error("Failed to send verification email:", err);
  }

  return {
    id: newUser._id,
    fullName: newUser.fullName,
    email: newUser.email,
    role: newUser.role,
  };
};

// =============================== LOGIN ===============================
export const loginUser = async ({ email, password }) => {
  if (!email || !password)
    throw new AppError("Email and password are required", 400);

  const existingUser = await User.findOne({ email }).select(
    "+password +loginAttempts +lockUntil"
  );
  if (!existingUser) throw new AppError("Invalid credentials", 401);

  // Locked due to failed attempts?
  if (existingUser.lockUntil && existingUser.lockUntil > Date.now()) {
    throw new AppError("Too many failed attempts. Try again later.", 423);
  }

  // Check password
  const isMatch = await existingUser.comparePassword(password);
  if (!isMatch) {
    await existingUser.incrementLoginAttempts(MAX_LOGIN_ATTEMPTS, LOCK_TIME_MS);
    throw new AppError("Invalid credentials", 401);
  }

  // Success: reset attempts
  await existingUser.resetLoginAttempts();

  const accessToken = signToken(existingUser);

  return {
    accessToken,
    user: {
      id: existingUser._id,
      fullName: existingUser.fullName,
      email: existingUser.email,
      role: existingUser.role,
      isVerified: existingUser.isVerified,
    },
  };
};

// =============================== LOGOUT ===============================
export const logoutUser = async () => {
  // No refresh tokens → nothing to clear
  return { message: "Logged out successfully" };
};

// =============================== FORGOT PASSWORD ===============================
export const forgotPasswordService = async (email) => {
  const currentUser = await User.findOne({ email });
  if (!currentUser) throw new AppError("User not found", 404);

  const resetToken = currentUser.getResetToken();
  await currentUser.save({ validateBeforeSave: false });

  const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  await sendEmail({
    email: currentUser.email,
    subject: "Password Reset",
    text: `Reset your password here: ${resetURL}`,
  });

  return { resetURL };
};

// =============================== RESET PASSWORD ===============================
export const resetPasswordService = async (token, newPassword) => {
  const hashedToken = hashToken(token);
  const currentUser = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!currentUser) throw new AppError("Invalid or expired token", 400);

  currentUser.password = newPassword;
  currentUser.passwordConfirm = newPassword;

  await currentUser.save();

  const accessToken = signToken(currentUser);

  return {
    accessToken,
    user: {
      id: currentUser._id,
      fullName: currentUser.fullName,
      email: currentUser.email,
      role: currentUser.role,
    },
  };
};

// =============================== VERIFY EMAIL ===============================
export const verifyEmailService = async (token) => {
  const hashed = hashToken(token);
  const currentUser = await User.findOne({
    emailVerifyToken: hashed,
    emailVerifyExpire: { $gt: Date.now() },
  });

  if (!currentUser) throw new AppError("Invalid or expired token", 400);

  currentUser.isVerified = true;
  currentUser.emailVerifyToken = undefined;
  currentUser.emailVerifyExpire = undefined;

  await currentUser.save();
  return { message: "Email verified" };
};

// =============================== RESEND VERIFY EMAIL ===============================
export const sendVerificationEmailService = async (userId) => {
  const currentUser = await User.findById(userId);
  if (!currentUser) throw new AppError("User not found", 404);

  const token = currentUser.createEmailVerifyToken();
  await currentUser.save({ validateBeforeSave: false });

  const verifyURL = `${process.env.CLIENT_URL}/verify-email/${token}`;

  await sendEmail({
    email: currentUser.email,
    subject: "Verify your email",
    text: `Verify here: ${verifyURL}`,
  });

  return { verifyURL };
};

// =============================== CHANGE PASSWORD ===============================
export const changePassword = async (userId, oldPassword, newPassword) => {
  const currentUser = await User.findById(userId).select("+password");
  if (!currentUser) throw new AppError("User not found", 404);

  const isMatch = await currentUser.comparePassword(oldPassword);
  if (!isMatch) throw new AppError("Old password incorrect", 400);

  currentUser.password = newPassword;
  currentUser.passwordConfirm = newPassword;

  await currentUser.save();

  const accessToken = signToken(currentUser);

  return {
    user: {
      id: currentUser._id,
      fullName: currentUser.fullName,
      email: currentUser.email,
      role: currentUser.role,
    },
    accessToken,
  };
};

// services/authService.js (Backend)

export const getMeService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("No user found with that ID", 404);
  }

  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };
};
