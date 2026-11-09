import { validationResult } from "express-validator";
import AppError from "./AppError.js";

export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  next(); // ✅ REQUIRED — without this request will hang
};
