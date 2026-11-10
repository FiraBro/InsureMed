import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiBell,
  FiFileText,
  FiHeadphones,
  FiHome,
  FiLogOut,
  FiMenu,
  FiPlusCircle,
  FiSearch,
  FiShield,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useAuthStore } from "@/stores/authStore";
import InsuranceChatbot from "@/pages/users/support/Chatbot";

const dashboardLinks = [
  { label: "Overview", to: "/dashboard", icon: FiHome, end: true },
  { label: "Browse Plans", to: "/dashboard/plans", icon: FiSearch },
  { label: "My Policies", to: "/dashboard/my-policies", icon: FiShield },
  { label: "Claims", to: "/dashboard/show/claims", icon: FiFileText },
  { label: "Submit Claim", to: "/dashboard/claims/new", icon: FiPlusCircle },
  { label: "Applications", to: "/dashboard/my-applications", icon: FiActivity },
  { label: "Notifications", to: "/dashboard/notifications", icon: FiBell },
  { label: "Profile", to: "/dashboard/profile", icon: FiUser },
  { label: "Support", to: "/dashboard/support", icon: FiHeadphones },
];

function SidebarLinks({ onNavigate }) {
  return dashboardLinks.map(({ label, to, icon: Icon, end }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          isActive
            ? "bg-blue-50 text-blue-700"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  ));
}

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isTicketConversation = /\/dashboard\/support\/tickets\/[^/]+$/.test(pathname);
  const firstName = user?.fullName?.trim().split(/\s+/)[0] || "Account";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={isSidebarOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isSidebarOpen}
            onClick={() => setIsSidebarOpen((open) => !open)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          <Link to="/" aria-label="NeuralSure home" className="flex shrink-0 items-center">
            <img
              src="/logo.png"
              alt="NeuralSure"
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-500 sm:inline">
            Welcome, {firstName}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <FiLogOut size={17} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-slate-950/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed bottom-0 left-0 top-16 z-30 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav
          aria-label="Dashboard navigation"
          className="flex-1 space-y-1 overflow-y-auto p-4"
        >
          <SidebarLinks onNavigate={() => setIsSidebarOpen(false)} />
        </nav>
      </aside>

      <main className="min-h-screen pt-16 lg:pl-64">
        <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
      {!isTicketConversation && <InsuranceChatbot />}
    </div>
  );
}
