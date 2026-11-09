import * as authService from "../services/authService.js";
import catchAsync from "../utils/catchAsync.js";

// =============================== REGISTER ===============================
export const register = catchAsync(async (req, res) => {
  // Input validation handled by validator middleware
  const result = await authService.registerUser(req.body);
  res.status(201).json({ status: "success", data: result });
});

// =============================== LOGIN ===============================
export const login = catchAsync(async (req, res) => {
  const { accessToken, user } = await authService.loginUser(req.body);

  const cookieOptions = {
    // Cookie expires in 1 day (standard practice)
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
    sameSite: "Lax",
  };

  // Set the cookie in the response
  res.cookie("jwt", accessToken, cookieOptions);

  // Still send the user data and token (optional) to the frontend
  res.json({
    status: "success",
    data: { accessToken, user },
  });
});

// =============================== LOGOUT ===============================
export const logout = catchAsync(async (req, res) => {
  await authService.logoutUser();

  // Clear the cookie by setting it to expire immediately
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000), // expires in 10 seconds
    httpOnly: true,
  });

  res.json({ status: "success", message: "Logged out successfully" });
});

// =============================== FORGOT PASSWORD ===============================
export const forgotPassword = catchAsync(async (req, res) => {
  const { resetURL } = await authService.forgotPasswordService(req.body.email);
  res.json({ status: "success", data: { resetURL } });
});

// =============================== RESET PASSWORD ===============================
export const resetPassword = catchAsync(async (req, res) => {
  const data = await authService.resetPasswordService(
    req.params.token,
    req.body.password
  );
  res.json({ status: "success", data });
});

// =============================== VERIFY EMAIL ===============================
export const verifyEmail = catchAsync(async (req, res) => {
  const result = await authService.verifyEmailService(req.params.token);
  res.json({ status: "success", data: result });
});

// =============================== RESEND VERIFICATION ===============================
export const resendVerification = catchAsync(async (req, res) => {
  const result = await authService.sendVerificationEmailService(req.user.id);
  res.json({ status: "success", data: result });
});

// =============================== CHANGE PASSWORD ===============================
export const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const data = await authService.changePassword(
    req.user.id,
    oldPassword,
    newPassword
  );
  res.json({ status: "success", data });
});

// =============================== UPDATE EMAIL ===============================
export const updateEmail = catchAsync(async (req, res) => {
  const result = await authService.updateEmail(req.user.id, req.body.newEmail);
  res.json({ status: "success", data: result });
});

// =============================== GET ME ===============================
export const getMe = catchAsync(async (req, res, next) => {
  // Use the ID attached by the 'protect' middleware
  const user = await authService.getMeService(req.user.id);

  res.status(200).json({
    status: "success",
    data: { user },
  });
});
