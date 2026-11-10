import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-100 bg-white/95 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link to="/" className="flex items-center gap-1.5 select-none">
            <img
              src="/logo.png"
              alt="NeuralSure Logo"
              className="h-20 sm:h-24 w-auto object-contain"
            />
          </Link>
        </motion.div>

        <nav
          aria-label="Main navigation"
          className="flex items-center gap-3 sm:gap-6"
        >
          <Link to="/auth" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-700">Login</Link>
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/auth?mode=register"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Register <FiArrowRight size={16} />
            </Link>
          </motion.div>
        </nav>
      </div>
    </header>
  );
}
