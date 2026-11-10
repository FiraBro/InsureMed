// Topbar.jsx
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
import { useEnterpriseDashboard } from "@/hooks/useAdmin";
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
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export default function Topbar() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const { executeSearch, searchResults, isSearching, clearSearch } =
    useEnterpriseDashboard();
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

  // Icon mapping for categories (same colors as before)
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
        return <FiSearch className="text-slate-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* Search */}
      <div className="group relative max-w-xl flex-1" ref={searchRef}>
        <div className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2">
          {isSearching ? (
            <FiLoader className="animate-spin text-blue-600" />
          ) : (
            <FiSearch className="text-slate-400 transition-colors group-focus-within:text-blue-600" />
          )}
        </div>

        <Input
          type="text"
          placeholder="Search everything... (Policies, Users, Claims)"
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-14 text-sm shadow-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus-visible:ring-2 focus-visible:ring-blue-500/20"
          onChange={(e) => {
            executeSearch(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
        />

        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-sans text-[11px] font-medium text-slate-400 md:flex">
          <FiCommand className="h-3 w-3" />K
        </kbd>

        {/* Search results */}
        <AnimatePresence>
          {showResults && searchResults.length > 0 && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute top-full z-50 mt-2 max-h-[480px] w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg"
            >
              <ul className="p-1.5">
                {searchResults.map((result) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      onClick={() => handleResultClick(result.link)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-400"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
                        {getCategoryIcon(result.category)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-900">
                          {result.title}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {result.subtitle}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-slate-500">
                        {result.category}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
                Showing {searchResults.length} results
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* <button
          type="button"
          aria-label="Help"
          className="hidden rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:block"
        >
          <FiHelpCircle className="text-lg" />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="group relative rounded-lg p-2 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <FiBell className="text-lg text-slate-600 group-hover:text-slate-900" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
        </button> */}

        <div className="mx-2 h-6 w-px bg-slate-200" />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="group flex items-center gap-3 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 md:pr-3">
            <span className="relative">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-sm font-semibold text-white">
                {user?.email?.charAt(0).toUpperCase() || "A"}
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            </span>

            <span className="hidden text-left md:block">
              <span className="block text-sm font-medium leading-tight text-slate-900">
                {user?.displayName || "Admin User"}
              </span>
            </span>
            <FiChevronDown className="text-xs text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="mt-2 w-60 rounded-xl border-slate-200 bg-white p-1.5 shadow-lg"
          >
            <DropdownMenuLabel className="px-3 py-2 text-xs font-medium text-slate-500">
              Account Management
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuItem className="cursor-pointer rounded-lg py-2.5 focus:bg-blue-50 focus:text-blue-700">
              <FiSettings className="mr-3 h-4 w-4" />
              <span className="font-medium">System Settings</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer rounded-lg py-2.5 focus:bg-blue-50 focus:text-blue-700">
              <FiHelpCircle className="mr-3 h-4 w-4" />
              <span className="font-medium">Documentation</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1" />

            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer rounded-lg py-2.5 text-red-600 focus:bg-red-50 focus:text-red-700"
            >
              <FiLogOut className="mr-3 h-4 w-4" />
              <span className="font-medium">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
