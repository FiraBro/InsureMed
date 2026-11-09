import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FiMenu, FiX, FiChevronDown, FiLogOut } from "react-icons/fi";
import { useAuthStore } from "@/stores/authStore";

// Animation variants (kept as requested)
const mobileMenuVariants = {
  closed: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: "easeOut",
      staggerChildren: 0.05,
      when: "beforeChildren",
    },
  },
};

const menuItemVariants = {
  closed: { opacity: 0, x: -10 },
  open: { opacity: 1, x: 0 },
};

const dropdownVariants = {
  closed: {
    opacity: 0,
    scale: 0.95,
    y: -8,
    transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
  },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
};

const dropdownItemVariants = {
  closed: { opacity: 0, y: -4 },
  open: { opacity: 1, y: 0 },
};

const UserDropdown = ({ user, isOpen, onClose, onLogout }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  const userMenuItems = [
    { label: "Profile", onClick: () => navigate("/profile") },
    { label: "My Applications", onClick: () => navigate("/my-applications") },
    { label: "Notifications", onClick: () => navigate("/notifications") },
    { label: "Billing", onClick: () => navigate("/billing") },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-xl z-50 overflow-hidden"
          variants={dropdownVariants}
          initial="closed"
          animate="open"
          exit="closed"
        >
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar} alt={user.fullName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                  {user.fullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 text-sm">
                  {user.fullName}
                </span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {userMenuItems.map((item) => (
              <motion.button
                key={item.label}
                variants={dropdownItemVariants}
                onClick={() => {
                  item.onClick();
                  onClose();
                }}
                className="w-full flex items-center p-2.5 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors duration-150 text-left"
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            ))}
          </div>

          <div className="p-2 border-t border-gray-100">
            <motion.button
              variants={dropdownItemVariants}
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center space-x-3 p-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-150 text-left"
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiLogOut size={16} />
              <span className="text-sm font-medium">Logout</span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleGetStarted = () => {
    if (user) navigate("/plans");
    else navigate("/auth");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { to: "/", text: "Home", active: location.pathname === "/" },
    {
      to: "/show/claims",
      text: "Claims",
      active: location.pathname === "/show/claims",
    },
    {
      to: "/claims/new",
      text: "Submit Claim",
      active: location.pathname === "/claims/new",
    },
    {
      to: "/my-applications",
      text: "Applications",
      active: location.pathname === "/my-applications",
    },
    {
      to: "/my-policies",
      text: "My Policies",
      active: location.pathname === "/my-policies",
    },
    {
      to: "/support",
      text: "Support",
      active: location.pathname === "/support",
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "bg-white/98 shadow-sm backdrop-blur-md py-3 border-b border-gray-100"
          : "bg-white/95 backdrop-blur-sm py-4 border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-shrink-0"
          >
            <Link to="/" className="flex items-center gap-3 select-none">
              <div className="relative">
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4"></span>
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

          {/* Desktop Navigation - NO ICONS */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <motion.div
                key={link.to}
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
              >
                <Link
                  to={link.to}
                  className={`relative px-4 py-2.5 rounded-lg font-medium text-sm transition-colors duration-150 ${
                    link.active
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <span>{link.text}</span>
                  {link.active && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full"
                      layoutId="activeIndicator"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm hover:shadow transition-all duration-150 cursor-pointer"
                  >
                    All Plans
                  </Button>
                </motion.div>

                <div className="relative">
                  <motion.button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Avatar className="w-9 h-9 border-2 border-white shadow-sm">
                      <AvatarImage src={user.avatar} alt={user.fullName} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                        {user.fullName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <motion.div
                      animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <FiChevronDown size={18} className="text-gray-500" />
                    </motion.div>
                  </motion.button>

                  <UserDropdown
                    user={user}
                    isOpen={isUserMenuOpen}
                    onClose={() => setIsUserMenuOpen(false)}
                    onLogout={handleLogout}
                  />
                </div>
              </>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/auth")}
                    className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 text-sm transition-colors duration-150"
                  >
                    Sign In
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm hover:shadow text-sm transition-all duration-150"
                  >
                    Get Started
                  </Button>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button - ICON KEPT (UI Necessity) */}
          <div className="flex lg:hidden items-center">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors duration-150"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                  >
                    <FiX size={24} className="text-gray-700" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                  >
                    <FiMenu size={24} className="text-gray-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 lg:hidden z-40"
                onClick={() => setIsMenuOpen(false)}
              />
              <motion.div
                ref={mobileMenuRef}
                className="fixed inset-x-0 top-16 bg-white border-t border-gray-200 shadow-xl lg:hidden z-50"
                variants={mobileMenuVariants}
                initial="closed"
                animate="open"
                exit="closed"
                style={{
                  height: "auto",
                  maxHeight: "calc(100vh - 4rem)",
                  overflowY: "auto",
                }}
              >
                {/* User Info */}
                {user && (
                  <motion.div
                    variants={menuItemVariants}
                    className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                        <AvatarImage src={user.avatar} alt={user.fullName} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                          {user.fullName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {user.fullName}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Links - NO ICONS */}
                <nav className="p-4">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.to}
                      variants={menuItemVariants}
                      custom={index}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={link.to}
                        className={`flex items-center p-3 rounded-lg mb-2 transition-colors duration-150 ${
                          link.active
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="font-medium">{link.text}</span>
                        {link.active && (
                          <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* Account Links - NO ICONS */}
                {user && (
                  <div className="p-4 border-t border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                      Account
                    </h3>
                    <div className="space-y-1">
                      {[
                        {
                          label: "Profile",
                          onClick: () => navigate("/profile"),
                        },
                        {
                          label: "My Applications",
                          onClick: () => navigate("/my-applications"),
                        },
                        {
                          label: "Notifications",
                          onClick: () => navigate("/notifications"),
                        },
                        {
                          label: "Billing",
                          onClick: () => navigate("/billing"),
                        },
                        {
                          label: "Settings",
                          onClick: () => navigate("/settings"),
                        },
                        {
                          label: "Security",
                          onClick: () => navigate("/security"),
                        },
                        {
                          label: "Help Center",
                          onClick: () => navigate("/help"),
                        },
                      ].map((item, index) => (
                        <motion.div
                          key={item.label}
                          variants={menuItemVariants}
                          custom={index + navLinks.length}
                        >
                          <button
                            onClick={() => {
                              item.onClick();
                              setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-150 text-left"
                          >
                            <span className="font-medium">{item.label}</span>
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <div className="space-y-3">
                    <motion.div variants={menuItemVariants}>
                      <Button
                        onClick={() => {
                          if (user) navigate("/plans");
                          else navigate("/auth");
                          setIsMenuOpen(false);
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3"
                      >
                        {user ? "All Plans" : "Get Started Free"}
                      </Button>
                    </motion.div>
                    {user && (
                      <motion.div variants={menuItemVariants}>
                        <Button
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                          variant="outline"
                          className="w-full border-gray-300 text-gray-700 py-3"
                        >
                          Sign Out
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
