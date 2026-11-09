import React, { Suspense, useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { router } from "./routers";
import { useAuthStore } from "@/stores/authStore";
import { useEnterpriseDashboard } from "./hooks/useAdmin";
import MaintenancePage from "./pages/users/support/Maintenance";

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const user = useAuthStore((state) => state.user);
  const { settings, isLoading } = useEnterpriseDashboard();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) return null;

  // --- MAINTENANCE GATE LOGIC ---
  const isMaintenanceActive =
    settings?.maintenanceMode === true ||
    String(settings?.maintenanceMode) === "true";
  const isUserNotAdmin = user?.role !== "admin";

  if (isMaintenanceActive && isUserNotAdmin) {
    return <MaintenancePage />;
  }

  return (
    <>
      <Suspense fallback={null}>
        <RouterProvider router={router} />
      </Suspense>

      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </>
  );
}
