import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-100 bg-white/95 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link to="/" className="flex items-center gap-1.5 select-none">
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Neural<span className="text-blue-500">Sure</span>
            </span>
            <span className="rounded bg-gradient-to-r from-[#4285F4] via-[#9B72CB] to-[#D96570] px-1.5 py-0.5 text-[10px] font-bold text-white">
              AI
            </span>
          </Link>
        </motion.div>

        <nav aria-label="Main navigation" className="flex items-center gap-3 sm:gap-6">
          <Link
            to="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
          >
            Home
          </Link>
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Go to Dashboard <FiArrowRight size={16} />
            </Link>
          </motion.div>
        </nav>
      </div>
    </header>
  );
}
