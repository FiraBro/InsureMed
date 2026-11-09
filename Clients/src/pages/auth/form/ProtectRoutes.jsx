import { useAuthStore } from "@/stores/authStore";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, isAdminRequired = false }) => {
  const { isAuthenticated, authReady, user } = useAuthStore();

  // 1. Wait for auth state to initialize
  if (!authReady) return null;

  // 2. If not logged in at all, kick to login
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // 3. If admin is required but user is a normal user, kick to home/dashboard
  if (isAdminRequired && user?.role !== "admin") {
    console.warn("Access denied: Admin privileges required.");
    return <Navigate to="/" replace />; // Or a custom 403 Forbidden page
  }

  return children;
};

export default ProtectedRoute;
