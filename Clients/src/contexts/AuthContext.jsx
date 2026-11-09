import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "@/services/authService";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  /* =====================================
   🔹 INITIALIZATION & VALIDATION
   Runs once when the app loads
  ===================================== */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Quick Hydration: Read from LocalStorage so UI feels fast
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedToken) setAccessToken(storedToken);

        // 2. Server Verification: Verify the session is actually valid
        // This handles cases where JWT_ACCESS_EXPIRES has passed
        const res = await authService.getMe();

        if (res.status === "success" && res.data.user) {
          setUser(res.data.user);
          // Token is handled by the HTTP-only cookie or current accessToken state
        }
      } catch (err) {
        console.error("Session invalid or expired", err);
        // Clear state if the server says the token is dead
        handleClearAuth();
      } finally {
        setAuthReady(true);
      }
    };

    initializeAuth();
  }, []);

  /* =====================================
   🔹 HELPER: CLEAR AUTH
  ===================================== */
  const handleClearAuth = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  /* =====================================
   🔹 LOGIN
  ===================================== */
  const login = async (credentials) => {
    const res = await authService.login(credentials);

    if (res.status === "success" && res.data) {
      const { user: userData, accessToken: token } = res.data;

      setUser(userData);
      setAccessToken(token);

      // Persist for hydration on next refresh
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);
    }
    return res;
  };

  /* =====================================
   🔹 LOGOUT
  ===================================== */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout request failed", err);
    } finally {
      handleClearAuth();
    }
  };

  /* =====================================
   🔹 LOADING STATE
  ===================================== */
  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        authReady,
        isAuthenticated: !!user,

        login,
        logout,
        register: authService.register,
        forgotPassword: authService.forgotPassword,
        resetPassword: authService.resetPassword,
        verifyEmail: authService.verifyEmail,
        resendVerificationEmail: authService.resendVerificationEmail,
        changePassword: authService.changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
