import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { hashToken } from "../utils/hashToken.js";
import { ROLES } from "../constants/roles.js";

// User schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  passwordConfirm: {
    type: String,
    required: function () {
      return this.isNew;
    },
    validate: {
      validator: function (val) {
        return this.password === val;
      },
      message: "Passwords do not match!",
    },
    select: false,
  },
  role: { type: String, enum: ROLES, default: "customer" },

  phone: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ["male", "female", "other"] },
  profilePicture: { type: String },

  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },

  // Password reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // Email verify
  emailVerifyToken: String,
  emailVerifyExpire: Date,

  // Brute force protection
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordConfirm = undefined;
  next();
});

// Compare password
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Generate password reset token
userSchema.methods.getResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = hashToken(resetToken);
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
  return resetToken;
};

// Generate email verification token
userSchema.methods.createEmailVerifyToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerifyToken = hashToken(token);

  const expireMinutes = process.env.EMAIL_VERIFY_EXPIRES_MINUTES
    ? parseInt(process.env.EMAIL_VERIFY_EXPIRES_MINUTES)
    : 1440;

  this.emailVerifyExpire = Date.now() + expireMinutes * 60 * 1000;

  return token;
};

// Brute Force / Lock
userSchema.methods.incrementLoginAttempts = async function (
  maxAttempts = 5,
  lockTimeMs = 15 * 60 * 1000
) {
  this.loginAttempts = (this.loginAttempts || 0) + 1;
  if (this.loginAttempts >= maxAttempts)
    this.lockUntil = new Date(Date.now() + lockTimeMs);
  return this.save();
};

userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.save();
};

export default mongoose.model("User", userSchema);
