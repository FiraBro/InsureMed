import React, { useState, useRef, useEffect } from "react";
import {
  FiSearch,
  FiBell,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiChevronDown,
  FiCommand,
  FiLoader,
  FiUser,
  FiFileText,
  FiShield,
  FiActivity,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
import { useEnterpriseDashboard } from "@/hooks/useAdmin"; // Import your hook
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

// Animation for Search Dropdown
const dropdownVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.1 } },
};

export default function Topbar() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  // 1. Hook Integration
  const { executeSearch, searchResults, isSearching, clearSearch } =
    useEnterpriseDashboard();
  console.log("search result:", searchResults);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (link) => {
    navigate(link);
    clearSearch();
    setShowResults(false);
  };

  // Icon mapping for categories
  const getCategoryIcon = (category) => {
    switch (category) {
      case "Users":
        return <FiUser className="text-blue-500" />;
      case "Policies":
        return <FiShield className="text-emerald-500" />;
      case "Claims":
        return <FiActivity className="text-amber-500" />;
      case "Insurance Plans":
        return <FiFileText className="text-purple-500" />;
      default:
        return <FiSearch />;
    }
  };
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -12 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };
  return (
    <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 flex items-center justify-between px-6 shadow-sm">
      {/* 1. Global Search: Pro "Command Palette" Style */}
      <div className="flex-1 max-w-md relative group" ref={searchRef}>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
          {isSearching ? (
            <FiLoader className="text-blue-600 animate-spin" />
          ) : (
            <FiSearch className="text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          )}
        </div>

        <Input
          type="text"
          placeholder="Search everything... (Policies, Users, Claims)"
          className="pl-10 pr-12 bg-slate-100/50 border-transparent focus:bg-white focus:border-blue-500/30 focus-visible:ring-4 focus-visible:ring-blue-500/10 transition-all rounded-xl w-full text-sm"
          onChange={(e) => {
            executeSearch(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm select-none">
          <FiCommand className="text-[10px] text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400">K</span>
        </div>

        {/* --- SEARCH RESULTS DROPDOWN --- */}
        <AnimatePresence>
          {showResults && searchResults.length > 0 && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute top-full mt-2 w-full bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden z-50 max-h-[480px] overflow-y-auto"
            >
              <div className="p-2">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result.link)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all group text-left"
                  >
                    <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                      {getCategoryIcon(result.category)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {result.title}
                        </p>
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {result.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {result.subtitle}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="bg-slate-50 p-2 border-t border-slate-100">
                <p className="text-[10px] text-center text-slate-400 font-medium">
                  Showing {searchResults.length} results
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* 2. Right Side Actions */}
      <div className="flex items-center gap-3">
        {/* Help Circle */}
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors hidden sm:block">
          <FiHelpCircle className="text-lg" />
        </button>

        {/* Notifications with Pulse */}
        <div className="relative p-2 hover:bg-blue-50 group rounded-lg cursor-pointer transition-all">
          <FiBell className="text-slate-600 group-hover:text-blue-600 text-lg" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white ring-2 ring-red-500/20 animate-pulse" />
        </div>

        <div className="h-8 w-px bg-slate-200 mx-1" />

        {/* 3. User Dropdown Menu with Staggered Animation */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 hover:bg-slate-100 p-1 rounded-xl transition-all focus:outline-none group">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/20 border border-white/20">
                {user?.email?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
            </div>

            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-900 leading-none">
                {user?.displayName || "Admin User"}
              </p>
              <p className="text-[10px] font-medium text-blue-600 mt-1 flex items-center gap-1">
                <span className="h-1 w-1 bg-blue-600 rounded-full animate-pulse" />
                Underwriting Dept
              </p>
            </div>
            <FiChevronDown className="text-slate-400 text-xs group-data-[state=open]:rotate-180 transition-transform duration-300" />
          </DropdownMenuTrigger>

          {/* asChild allows Framer Motion to take over the wrapper */}
          <DropdownMenuContent
            asChild
            align="end"
            className="w-64 p-2 mt-2 rounded-2xl shadow-2xl border-slate-200 bg-white"
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Account Management
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="my-1 opacity-50" />

              <motion.div variants={itemVariants}>
                <DropdownMenuItem className="rounded-lg py-2.5 focus:bg-blue-50 focus:text-blue-700 cursor-pointer">
                  <FiSettings className="mr-3 h-4 w-4" />
                  <span className="font-medium">System Settings</span>
                </DropdownMenuItem>
              </motion.div>

              <motion.div variants={itemVariants}>
                <DropdownMenuItem className="rounded-lg py-2.5 focus:bg-blue-50 focus:text-blue-700 cursor-pointer">
                  <FiHelpCircle className="mr-3 h-4 w-4" />
                  <span className="font-medium">Documentation</span>
                </DropdownMenuItem>
              </motion.div>

              <DropdownMenuSeparator className="my-1 opacity-50" />

              <motion.div variants={itemVariants}>
                <DropdownMenuItem
                  onClick={logout}
                  className="rounded-lg py-2.5 text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                >
                  <FiLogOut className="mr-3 h-4 w-4" />
                  <span className="font-medium">Sign out</span>
                </DropdownMenuItem>
              </motion.div>
            </motion.div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
