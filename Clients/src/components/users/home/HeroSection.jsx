import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export default function HeroSection() {
  const { authReady, isAuthenticated, user } = useAuthStore();
  const isLoggedIn = authReady && isAuthenticated;
  const ctaPath = !isLoggedIn
    ? "/auth"
    : user?.role === "admin"
      ? "/admin/dashboard"
      : "/dashboard/plans";

  return (
    <section className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-6">
      <div className="max-w-3xl text-center">
        {/* Headline - Updated to focus on Insurance Management */}
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Your Protection, Our Priority
        </motion.h1>

        {/* Subtext - Updated to general insurance management */}
        <motion.p
          className="mt-4 text-lg md:text-xl text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Compare health, life, and family protection plans, then manage your
          coverage, applications, and claims in one secure place.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Link to={ctaPath}>
            <Button
              size="lg"
              className="px-8 flex items-center gap-2 w-full md:w-auto cursor-pointer"
            >
              {isLoggedIn ? "Explore Insurance Plans" : "Login / Register"}{" "}
              <FiArrowRight />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
