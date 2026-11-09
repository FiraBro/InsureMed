import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";

import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthForm() {
  const navigate = useNavigate();
  const { user, login, register } = useAuthStore();

  const [activeMode, setActiveMode] = useState("login");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    profilePicture: null,
    address: { street: "", city: "", state: "", zip: "", country: "" },
  });

  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin/dashboard" : "/");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "file" ? files[0] : value,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      password: "",
      passwordConfirm: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      profilePicture: null,
      address: { street: "", city: "", state: "", zip: "", country: "" },
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await login({
      email: formData.email,
      password: formData.password,
    });
    setIsLoading(false);

    if (result.status === "success") {
      toast.success("Login successful!");
      const userRole = result.data?.user?.role || user?.role;
      navigate(userRole === "admin" ? "/admin/dashboard" : "/");
    } else {
      toast.error(result?.message || "Invalid credentials");
    }
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      passwordConfirm: formData.passwordConfirm,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
    };

    const result = await register(payload);
    setIsLoading(false);

    if (result?.id || result?.status === "success") {
      toast.success("Account created! Please verify your email.");
      setActiveMode("login");
    } else {
      toast.error(result?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] p-4 md:p-8">
      {/* Main Container: 
          - max-w-5xl (approx 1024px) gives it that "Real World" dashboard/app feel.
          - transition-all handles the height/width change smoothly.
      */}
      <motion.div
        layout
        className={`w-full bg-white shadow-2xl shadow-blue-100/50 rounded-[2rem] overflow-hidden border border-gray-100 transition-all duration-500 ${
          activeMode === "login" ? "max-w-lg" : "max-w-5xl"
        }`}
      >
        <div className="p-8 md:p-12">
          {/* Header Section */}
          <div className="text-center mb-10">
            <motion.h2
              key={activeMode}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-black text-gray-900"
            >
              {activeMode === "login" ? "Welcome Back" : "Create Account"}
            </motion.h2>
            <p className="text-gray-500 mt-3 text-lg">
              {activeMode === "login"
                ? "Please enter your details to sign in."
                : "Join thousands of users today."}
            </p>
          </div>

          {/* Styled Mode Switcher */}
          <div className="flex p-1.5 bg-gray-100 rounded-2xl mb-10 max-w-xs mx-auto">
            <button
              onClick={() => {
                setActiveMode("login");
                resetForm();
              }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                activeMode === "login"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveMode("register");
                resetForm();
              }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                activeMode === "register"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form Content Area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMode}
              initial={{ opacity: 0, x: activeMode === "login" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeMode === "login" ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeMode === "login" ? (
                <LoginForm
                  formData={formData}
                  onChange={handleChange}
                  onSubmit={handleLogin}
                  isLoading={isLoading}
                />
              ) : (
                /* The Registration form will now have room to use a grid */
                <RegisterForm
                  formData={formData}
                  onChange={handleChange}
                  onSubmit={handleRegister}
                  isLoading={isLoading}
                  onSwitchToLogin={() => setActiveMode("login")}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
