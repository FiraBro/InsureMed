import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redisClient } from "../config/redis.js";

// Helper to create a store with a custom prefix
const createStore = (prefix) =>
  new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: `rl:${prefix}:`,
  });

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  store: createStore("auth"),
  // REAL WORLD LOGIC: Key by IP + Email
  keyGenerator: (req) => {
    const userEmail = req.body?.email || "anonymous";
    return `${ipKeyGenerator(req.ip)}_${userEmail}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      status: "fail",
      message: `Too many attempts for ${req.body.email}. Try again in 15m.`,
    });
  },
});

// --- ANALYTICS LIMITER ---
export const analyticsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60, // 60 requests per minute
  store: createStore("analytics"),
  standardHeaders: true,
  message: { status: 429, message: "Dashboard refresh limit reached." },
});

export const chatRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 chat requests per window
  message: "Too many chat requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
});
