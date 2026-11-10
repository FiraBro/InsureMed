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

  // Keep each role inside its own dashboard while allowing the public landing page.
  if (isAdminRequired && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  if (!isAdminRequired && user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
