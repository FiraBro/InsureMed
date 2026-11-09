import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function HeroSection() {
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
          Apply, manage, and track your insurance policies seamlessly.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {/* Explore Button - Redirects to /plan */}
          <Link to="/plans">
            <Button
              size="lg"
              className="px-8 flex items-center gap-2 w-full md:w-auto cursor-pointer"
            >
              Explore Plans <FiArrowRight />
            </Button>
          </Link>

          {/* Login Button - Redirects to /auth */}
          <Link to="/auth">
            <Button
              size="lg"
              variant="outline"
              className="px-8 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 w-full md:w-auto cursor-pointer"
            >
              Login / Register
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
