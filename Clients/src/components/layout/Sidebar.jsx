import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import {
  FiGrid,
  FiUsers,
  FiCheckCircle,
  FiActivity,
  FiLogOut,
  FiChevronRight,
  FiBriefcase, // For Policies
  FiPlusCircle, // For Create Plan
  FiList, // For All Plans
  FiLayers, // For Applications
  FiMessageSquare,
  FiBookOpen,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

const navItems = [
  {
    group: "Overview",
    items: [{ name: "Dashboard", path: "/admin/dashboard", icon: FiGrid }],
  },
  {
    group: "Operations",
    items: [
      { name: "Applications", path: "/admin/applications", icon: FiLayers },
      { name: "Policies", path: "/admin/all-policies", icon: FiBriefcase },
      { name: "Claims", path: "/admin/all-claims", icon: FiCheckCircle },
      { name: "Customers", path: "/admin/users", icon: FiUsers },
    ],
  },
  {
    group: "Product Engine",
    items: [
      { name: "New Plan", path: "/admin/create/plan", icon: FiPlusCircle },
      { name: "All Plans", path: "/admin/all-plans", icon: FiList },
    ],
  },
  {
    // NEW GROUP: For managing Live Chat and Support Tickets
    group: "Service Governance",
    items: [
      {
        name: "Support Desk",
        path: "/admin/support/tickets", // This points to your AdminSupportDashboard
        icon: FiMessageSquare, // Ensure you import FiMessageSquare from react-icons/fi
      },
    ],
  },
  {
    group: "Enterprise Intelligence",
    items: [
      {
        name: "Control Center",
        path: "/admin/settings",
        icon: FiActivity,
      },
      { name: "Documentation", path: "/admin/docs", icon: FiBookOpen },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <aside className="flex flex-col w-72 bg-white border-r border-zinc-200 h-screen sticky top-0 z-50">
      {/* Brand Section */}
      <div className="h-20 flex items-center px-6 mb-2">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-shrink-0"
        >
          <Link to="/" className="flex items-center gap-3 select-none">
            <img
              src="/logo.png"
              alt="NeuralSure"
              className="h-12 w-auto object-contain"
            />
          </Link>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 overflow-y-auto custom-scrollbar">
        {navItems.map((group, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="px-4 mb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
              {group.group}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) => cn(
                      "group flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-blue-500 text-white shadow-md shadow-zinc-200"
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50",
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <item.icon
                            className={cn(
                              "text-lg",
                              isActive ? "text-white" : "group-hover:text-blue-500",
                            )}
                          />
                          <span className="text-sm font-semibold tracking-tight">
                            {item.name}
                          </span>
                        </div>
                        {isActive && (
                          <motion.div
                            layoutId="arrow"
                            initial={{ x: -5 }}
                            animate={{ x: 0 }}
                          >
                            <FiChevronRight className="text-white" />
                          </motion.div>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Profile Section */}
    </aside>
  );
}
