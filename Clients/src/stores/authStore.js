import { create } from "zustand";
import { devtools } from "zustand/middleware";
import * as authService from "@/services/authService";

export const useAuthStore = create(
  devtools((set, get) => ({
    user: null,
    accessToken: null,
    authReady: false,
    isAuthenticated: false,

    /* -------------------- INITIALIZE SESSION -------------------- */
    initializeAuth: async () => {
      try {
        // 1️⃣ Hydrate from localStorage
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
          set({
            user: JSON.parse(storedUser),
            accessToken: storedToken,
            isAuthenticated: true,
          });
        }

        // 2️⃣ Verify session with backend only if token exists
        if (storedToken) {
          const res = await authService.getMe();
          if (res.status === "success" && res.data.user) {
            set({
              user: res.data.user,
              isAuthenticated: true,
            });
          } else {
            get().clearAuth();
          }
        } else {
          // No token => not authenticated
          get().clearAuth();
        }
      } catch (err) {
        console.error("Session invalid or expired", err);
        get().clearAuth();
      } finally {
        set({ authReady: true });
      }
    },

    /* -------------------- LOGIN -------------------- */
    login: async (credentials) => {
      const res = await authService.login(credentials);

      if (res.status === "success" && res.data) {
        const { user: userData, accessToken: token } = res.data;
        set({ user: userData, accessToken: token, isAuthenticated: true });

        // Persist to localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", token);
      }

      return res;
    },

    /* -------------------- LOGOUT -------------------- */
    logout: async () => {
      try {
        await authService.logout();
      } catch (err) {
        console.error("Logout failed", err);
      } finally {
        get().clearAuth();
      }
    },

    /* -------------------- CLEAR AUTH -------------------- */
    clearAuth: () => {
      set({ user: null, accessToken: null, isAuthenticated: false });
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },

    /* -------------------- OTHER ACTIONS -------------------- */
    register: authService.register,
    forgotPassword: authService.forgotPassword,
    resetPassword: authService.resetPassword,
    verifyEmail: authService.verifyEmail,
    resendVerificationEmail: authService.resendVerificationEmail,
    changePassword: authService.changePassword,
  }))
);
