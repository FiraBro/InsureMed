// validators/insurancePlanValidator.js
import { body, query } from "express-validator";
import { PLAN_TYPES } from "../constants/planTypes.js";

// ─────────────────────────────────────────
// CREATE PLAN VALIDATOR
// ─────────────────────────────────────────
export const createPlanValidator = [
  // REQUIRED
  body("name").notEmpty().withMessage("Plan name is required"),

  body("premium")
    .isFloat({ min: 1 })
    .withMessage("Premium must be a positive number"),

  body("coverageAmount")
    .isFloat({ min: 1 })
    .withMessage("Coverage amount must be a positive number"),

  // OPTIONAL STRINGS
  body("description").optional().isString(),
  body("shortDescription").optional().isString(),
  body("coverage").optional().isString(),

  // ✅ ENUM — MATCHES SCHEMA (lowercase)
  body("planType")
    .optional()
    .isIn(Object.values(PLAN_TYPES))
    .withMessage("Invalid plan type"),

  body("status")
    .optional()
    .isIn(["draft", "published", "archived"])
    .withMessage("Invalid status"),

  // ✅ ARRAYS
  body("features").optional().isArray(),
  body("exclusions").optional().isArray(),

  // ✅ NUMBERS
  body("minAge").optional().isInt({ min: 0 }),
  body("maxAge").optional().isInt({ min: 0 }),
  body("maxMembers").optional().isInt({ min: 1 }),

  // ✅ BOOLEAN FLAGS
  body("isPopular").optional().isBoolean(),
  body("isFeatured").optional().isBoolean(),

  // ✅ RISK SCORE OBJECT
  body("riskScore.score")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Risk score must be between 0 and 100"),

  body("riskScore.recommendations")
    .optional()
    .isArray()
    .withMessage("Risk recommendations must be an array"),
];

// ─────────────────────────────────────────
// UPDATE PLAN VALIDATOR
// ─────────────────────────────────────────
export const updatePlanValidator = [
  body("name").optional().isString(),
  body("premium").optional().isFloat({ min: 1 }),
  body("coverageAmount").optional().isFloat({ min: 1 }),
  body("description").optional().isString(),

  // ✅ LOWERCASE enum
  body("planType")
    .optional()
    .isIn(Object.values(PLAN_TYPES))
    .withMessage("Invalid plan type"),
];

// ─────────────────────────────────────────
// FILTER PLANS VALIDATOR
// ─────────────────────────────────────────
// validators/insurancePlanValidator.js

export const filterPlansValidator = [
  query("page").optional().isInt({ min: 1 }).toInt(), // .toInt() ensures it's a number
  query("limit").optional().isInt({ min: 1 }).toInt(),
  query("sortBy").optional().isString(),
  query("order").optional().isIn(["asc", "desc"]),

  query("planType")
    .optional()
    .isIn(Object.values(PLAN_TYPES))
    .withMessage("Invalid plan type"),

  // ✅ Changed to lowercase to match your frontend request and DB status
  query("status").optional().isIn(["draft", "published", "archived", "ALL"]),

  query("minPremium").optional().isFloat({ min: 0 }).toFloat(),
  query("maxPremium").optional().isFloat({ min: 0 }).toFloat(),
  query("search").optional().isString().trim(),
];
