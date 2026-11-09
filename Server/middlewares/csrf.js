import crypto from "crypto";

// Generate a secure random CSRF token
const generateToken = () => crypto.randomBytes(32).toString("hex");

/**
 * Middleware to SET CSRF COOKIE
 * This should be placed early in the app (before routes)
 * Sends a cookie:  XSRF-TOKEN
 */
export const csrfCookie = (req, res, next) => {
  if (!req.cookies["XSRF-TOKEN"]) {
    const token = generateToken();
    res.cookie("XSRF-TOKEN", token, {
      httpOnly: false, // frontend must read it
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
  }
  next();
};

/**
 * Middleware to VALIDATE CSRF TOKEN
 * Works for non-GET requests: POST/PUT/PATCH/DELETE
 * Expects token from: header "x-csrf-token"
 */
export const csrfProtection = (req, res, next) => {
  const METHOD = req.method.toUpperCase();

  // SAFE methods do not need validation
  const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];
  if (SAFE_METHODS.includes(METHOD)) return next();

  const csrfCookie = req.cookies["XSRF-TOKEN"];
  const csrfHeader = req.headers["x-csrf-token"];

  if (!csrfCookie || !csrfHeader) {
    return res.status(403).json({
      status: "fail",
      message: "Missing CSRF token",
    });
  }

  if (csrfCookie !== csrfHeader) {
    return res.status(403).json({
      status: "fail",
      message: "Invalid CSRF token",
    });
  }

  next();
};
