// dashboard/AdminLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { PageTransition } from "@/components/common/PageTransition";
import { motion } from "framer-motion";

export default function AdminLayout() {
  const { pathname } = useLocation();
  const isAdminLiveChat = /^\/admin\/tickets\/[^/]+$/.test(pathname);

  return (
    <div className="flex h-screen w-full bg-muted overflow-hidden">
      {/* Sidebar stays fixed */}
      <Sidebar />

      <div className="flex flex-1 flex-col min-w-0">
        {/* Topbar stays fixed */}
        <Topbar />

        {/* Main content area handles the scroll ONLY when needed */}
        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 p-6 overflow-y-auto bg-gray-100"
        >
          <PageTransition
            className={isAdminLiveChat ? "relative" : undefined}
          >
            <Outlet />
          </PageTransition>
        </motion.main>
      </div>
    </div>
  );
}
