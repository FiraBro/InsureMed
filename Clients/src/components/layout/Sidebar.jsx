import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
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
            <div className="relative">
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                  Neural<span className="text-blue-500">Sure</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-gradient-to-r from-[#4285F4] via-[#9B72CB] to-[#D96570]">
                  AI
                </span>
              </div>
            </div>
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
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "group flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-blue-500 text-white shadow-md shadow-zinc-200"
                          : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={cn(
                          "text-lg",
                          isActive ? "text-white" : "group-hover:text-blue-500"
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
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Profile Section */}
      <div className="p-4 mt-auto">
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-zinc-200">
              <img
                src={`https://api.dicebear.com/7.x/shapes/svg?seed=${
                  user?.fullName || "Admin"
                }`}
                alt="Avatar"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-zinc-900 truncate">
                {user?.fullName || "Administrator"}
              </p>
              <p className="text-[10px] font-medium text-zinc-500 truncate uppercase tracking-wider">
                {user?.role || "Super Admin"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-zinc-600 bg-white border border-zinc-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-200 active:scale-[0.98]"
          >
            <FiLogOut className="text-sm" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
