// utils/jwt.js
import jwt from "jsonwebtoken";

export const signToken = (user) => {
  // Debugging: This will show you exactly what value is being used in the logs
  const expiry = process.env.JWT_ACCESS_EXPIRES || "1d";

  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: expiry,
  });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // If it's an expiration error, let's be specific
    const message =
      err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    const error = new Error(message);
    error.statusCode = 401;
    throw error;
  }
};
