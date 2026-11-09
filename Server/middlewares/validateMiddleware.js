import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";

export default (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessage = errors.array()[0].msg;
    return next(new AppError(errorMessage, 400));
  }

  next();
};
