// middlewares/protect.js
import { verifyAccessToken } from "../utils/jwt.js";
import AppError from "../utils/AppError.js";
import User from "../models/user.js";
import { ROLES } from "../constants/roles.js";

// -----------------------------
// Protect route
// -----------------------------
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1) Get token from Authorization Header (Bearer Token)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // 2) Get token from Cookies (ensure key name matches controller: 'accessToken')
    else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    // If no token is found in either place
    if (!token) {
      return next(
        new AppError("You are not logged in. Please log in to get access.", 401)
      );
    }

    // 3) Verify the token (checks signature and expiration)
    // NOTE: If JWT_ACCESS_EXPIRES=1m, this will fail after 60 seconds!
    const payload = await verifyAccessToken(token);
    // Inside protect.js
    console.log(
      "Token expires at:",
      new Date(payload.exp * 1000).toLocaleString()
    );
    // 4) Check if user still exists in DB
    const currentUser = await User.findById(payload.id);
    if (!currentUser) {
      return next(
        new AppError("The user belonging to this token no longer exists.", 401)
      );
    }

    // 5) Grant Access: Store user data on the request object
    req.user = {
      id: currentUser._id,
      role: currentUser.role,
      email: currentUser.email,
    };

    next();
  } catch (err) {
    // If token is expired or invalid, catch the error here
    if (err.name === "TokenExpiredError") {
      return next(
        new AppError("Your session has expired. Please log in again.", 401)
      );
    }
    next(new AppError("Invalid token. Please log in again.", 401));
  }
};

// -----------------------------
// Generic Role Restriction
// -----------------------------
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array like ['admin', 'manager']
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(`You do not have permission to perform this action`, 403)
      );
    }
    next();
  };
};

// -----------------------------
// Admin only (Shortcut for restrictTo)
// -----------------------------
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== ROLES.ADMIN) {
    return next(new AppError("Admin access required", 403));
  }
  next();
};
