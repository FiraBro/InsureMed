import AppError from "../utils/AppError.js";
import { body, query } from "express-validator";

// ==================================================
// CREATE POLICY VALIDATOR
// ==================================================
const createPolicyValidator = [
  body("planId").notEmpty().withMessage("Plan ID is required"),
  body("startDate").isISO8601().withMessage("Valid start date required"),
  body("endDate").isISO8601().withMessage("Valid end date required"),
];

// ==================================================
// UPDATE POLICY STATUS VALIDATOR
// ==================================================
const updateStatusValidator = [
  body("status")
    .isIn(["active", "renewed", "cancelled"])
    .withMessage("Invalid policy status"),
];

// ==================================================
// PAGINATION & FILTER VALIDATOR
// ==================================================
const ALLOWED_SORT_FIELDS = ["createdAt", "updatedAt", "name", "premium"];

const paginationValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be an integer >= 1")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),

  query("sortBy")
    .optional()
    .isString()
    .custom((value) => {
      if (!ALLOWED_SORT_FIELDS.includes(value)) {
        throw new AppError(
          `Invalid sort field. Allowed: ${ALLOWED_SORT_FIELDS.join(", ")}`,
          400
        );
      }
      return true;
    }),

  query("order")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Order must be either 'asc' or 'desc'"),

  query("search").optional().trim().escape(),
];

// ==================================================
// RENEW POLICY VALIDATOR
// ==================================================
const requestRenewalValidator = [
  body("paymentReference")
    .notEmpty()
    .withMessage("Payment reference is required")
    .isString()
    .withMessage("Payment reference must be a string"),
];

// ==================================================
// EXPORT ALL
// ==================================================
export {
  createPolicyValidator,
  updateStatusValidator,
  paginationValidator,
  requestRenewalValidator,
};
