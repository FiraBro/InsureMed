import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1",
  withCredentials: true, // 👈 Required to send/receive HTTP-only cookies
});

/* =====================================
   🔹 REQUEST INTERCEPTOR
===================================== */
api.interceptors.request.use(
  (config) => {
    // If you use HTTP-only cookies, you DO NOT need to attach
    // the Bearer token manually. The browser does it automatically.
    // We only keep this if your backend still requires BOTH.
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =====================================
   🔹 RESPONSE INTERCEPTOR
===================================== */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // 🔐 401 Unauthorized usually means the cookie or token expired
    if (status === 401) {
      // Clear local storage data (user profile info)
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // Optional: Force redirect to login if not already there
      if (!window.location.pathname.includes("/auth")) {
        window.location.href = "/auth";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
