import { motion } from "framer-motion";
import { FiZap, FiShield, FiCpu, FiChevronRight } from "react-icons/fi";
import {
  HiOutlineBuildingOffice2,
  HiOutlineChartBar,
  HiOutlineDevicePhoneMobile,
} from "react-icons/hi2";

export default function BrandSection() {
  const features = [
    {
      icon: <FiZap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Sub-second authentication with global edge locations",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <FiShield className="w-6 h-6" />,
      title: "Bank-Level Security",
      description: "SOC 2 Type II certified with end-to-end encryption",
      gradient: "from-emerald-500 to-green-500",
    },
    {
      icon: <FiCpu className="w-6 h-6" />,
      title: "Easy Integration",
      description: "Seamless integration with your existing infrastructure",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  const clients = [
    { name: "TechCorp", icon: <HiOutlineChartBar className="w-8 h-8" /> },
    {
      name: "GlobalBank",
      icon: <HiOutlineBuildingOffice2 className="w-8 h-8" />,
    },
    {
      name: "Nexus Inc",
      icon: <HiOutlineDevicePhoneMobile className="w-8 h-8" />,
    },
  ];

  return (
    <div className="hidden md:flex flex-col justify-center p-8 md:p-12 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gradient-to-tr from-cyan-500/5 to-emerald-500/5 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Logo with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center space-x-3 mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl blur-lg opacity-60" />
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg relative"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </motion.div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              SecureAuth Pro
            </span>
            <span className="text-sm text-gray-500 font-medium">
              Enterprise Platform
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight mb-4">
            Enterprise-Grade
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Authentication
            </span>
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed max-w-xl">
            Join thousands of companies that trust our platform for secure,
            scalable authentication and identity management.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="space-y-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              whileHover={{ x: 5 }}
              className="group relative"
            >
              <div className="absolute -inset-2 bg-gradient-to-r opacity-0 group-hover:opacity-100 from-gray-100 via-white to-gray-100 rounded-2xl blur transition-opacity duration-300" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm group-hover:shadow-md transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div
                    className={`relative p-3 rounded-lg bg-gradient-to-br ${feature.gradient} shadow-sm`}
                  >
                    <div className="absolute inset-0 bg-white/10 rounded-lg" />
                    <div className="relative text-white">{feature.icon}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                      <motion.div
                        className="opacity-0 group-hover:opacity-100"
                        initial={{ x: -10 }}
                        animate={{ x: 0 }}
                      >
                        <FiChevronRight className="w-4 h-4 text-gray-400" />
                      </motion.div>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trusted By Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            <span className="text-sm font-medium text-gray-500 px-4">
              Trusted by industry leaders
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
          </div>

          <div className="flex items-center justify-center space-x-8">
            {clients.map((client, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center group"
              >
                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200/50 group-hover:shadow-md transition-all duration-300">
                  <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
                    {client.icon}
                  </div>
                </div>
                <span className="text-sm text-gray-600 font-medium mt-2">
                  {client.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="grid grid-cols-3 gap-6 p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200/50 shadow-sm"
        >
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              500+
            </div>
            <div className="text-sm text-gray-600 mt-1">Enterprise Clients</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              99.99%
            </div>
            <div className="text-sm text-gray-600 mt-1">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              24/7
            </div>
            <div className="text-sm text-gray-600 mt-1">Support</div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-12 pt-8 border-t border-gray-200/50"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500 mb-2">
                Join thousands of satisfied customers
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  +2,500 this month
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} SecureAuth Pro. All rights reserved.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
