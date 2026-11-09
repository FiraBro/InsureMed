import { body } from "express-validator";

// STRONG PASSWORD REGEX
const strongPassword =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=]).{8,}$/;

// PHONE REGEX (Ethiopian + E.164)
const phoneRegex = /^(?:\+251\d{9}|0[1-9]\d{8})$/;

// AGE CHECK
const isAdult = (date) => {
  const dob = new Date(date);
  if (isNaN(dob)) return false;

  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();

  const monthCheck =
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());

  return age > 18 || (age === 18 && !monthCheck);
};

// ================= REGISTER =================
export const registerValidator = [
  body("fullName").notEmpty().withMessage("Full name is required").trim(),

  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("password")
    .matches(strongPassword)
    .withMessage(
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
    ),

  body("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error("Passwords do not match");
      return true;
    }),

  body("phone")
    .matches(phoneRegex)
    .withMessage("Invalid phone number. Use +2519xxxxxxxx or 09xxxxxxxx"),

  body("dateOfBirth")
    .notEmpty()
    .withMessage("Date of birth is required")
    .custom((value) => {
      if (!isAdult(value)) throw new Error("You must be at least 18 years old");
      return true;
    }),

  body("role")
    .optional()
    .isIn(["customer", "admin", "agent"])
    .withMessage("Invalid role"),
];

// ================= LOGIN =================
export const loginValidator = [
  body("email").isEmail().withMessage("Valid email is required"),

  body("password").notEmpty().withMessage("Password is required"),
];

// ================= FORGOT PASSWORD =================
export const forgotPasswordValidator = [
  body("email").isEmail().withMessage("Valid email is required"),
];

// ================= RESET PASSWORD =================
export const resetPasswordValidator = [
  body("password")
    .matches(strongPassword)
    .withMessage(
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
    ),

  body("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => {
      if (value !== req.body.password)
        throw new Error("Passwords do not match");
      return true;
    }),
];
// ================= CHANGE PASSWORD =================
export const changePasswordValidator = [
  body("oldPassword").notEmpty().withMessage("Old password is required"),

  body("newPassword")
    .matches(strongPassword)
    .withMessage(
      "New password must be at least 8 characters and include uppercase, lowercase, number, and special character"
    ),

  body("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword)
        throw new Error("Passwords do not match");
      return true;
    }),
];
// ================= UPDATE EMAIL =================
export const updateEmailValidator = [
  body("newEmail")
    .notEmpty()
    .withMessage("New email is required")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
];
