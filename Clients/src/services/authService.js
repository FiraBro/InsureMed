import api from "../lib/axios";

export const login = async ({ email, password }) => {
  try {
    const res = await api.post("/auth/login", {
      email,
      password,
    });
    return res.data; // should include accessToken & user
  } catch (err) {
    console.error("Login failed:", err.response?.data || err.message);
    return { message: err.response?.data?.message || "Login failed" };
  }
};

export const register = async (userData) => {
  const res = await api.post("/auth/register", userData);
  return res.data;
};

export const logout = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

export const resetPassword = async (token, newPassword) => {
  const res = await api.post(`/auth/reset-password/${token}`, {
    password: newPassword,
  });
  return res.data.data; // { user, accessToken }
};

export const verifyEmail = async (token) => {
  const res = await api.get(`/auth/verify-email/${token}`);
  return res.data;
};

export const resendVerificationEmail = async (userId) => {
  const res = await api.post(`/auth/resend-verification/${userId}`);
  return res.data;
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  const res = await api.post(`/auth/change-password/${userId}`, {
    oldPassword,
    newPassword,
  });
  return res.data.data; // { user, accessToken }
};

export const getMe = async () => {
  const response = await api.get("/auth/me"); // Adjust path based on your route setup
  return response.data;
};
