import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiShield,
  FiTrendingUp,
} from "react-icons/fi";
import { Card } from "@/components/ui/card";

export default function StepRiskScore({ riskScore, isLoading }) {
  console.log("Risk Score Data:", riskScore);
  const score = riskScore?.riskScore ?? 0;

  // Professional color mapping
  const getTheme = (val) => {
    if (val <= 40)
      return {
        color: "#22c55e",
        label: "Safe",
        icon: <FiShield />,
        bg: "bg-green-500/10",
        text: "text-green-600",
      };
    if (val <= 70)
      return {
        color: "#eab308",
        label: "Moderate",
        icon: <FiTrendingUp />,
        bg: "bg-yellow-500/10",
        text: "text-yellow-600",
      };
    return {
      color: "#ef4444",
      label: "High Risk",
      icon: <FiAlertTriangle />,
      bg: "bg-red-500/10",
      text: "text-red-600",
    };
  };

  const theme = getTheme(score);

  return (
    <div className="space-y-8 py-4">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div
          className={`p-3 rounded-2xl ${theme.bg} ${theme.text} mb-2 animate-pulse`}
        >
          {theme.icon}
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">
          AI Risk Analysis
        </h2>
        <p className="text-slate-500 max-w-xs text-sm">
          Our neural engine is evaluating your plan's viability and market risk.
        </p>
      </div>

      {/* Main Gauge Display */}
      <div className="relative flex flex-col items-center justify-center">
        <svg className="w-64 h-64 transform -rotate-90">
          {/* Background Track */}
          <circle
            cx="128"
            cy="128"
            r="110"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-slate-100"
          />
          {/* Animated Progress Meter */}
          <motion.circle
            cx="128"
            cy="128"
            r="110"
            stroke={theme.color}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray="690"
            initial={{ strokeDashoffset: 690 }}
            animate={{ strokeDashoffset: 690 - (690 * score) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl font-black text-slate-800"
          >
            {isLoading ? "..." : score}
            <span className="text-2xl text-slate-400">%</span>
          </motion.span>
          <span
            className={`font-bold uppercase tracking-widest text-xs mt-1 ${theme.text}`}
          >
            {isLoading ? "Analyzing..." : theme.label}
          </span>
        </div>
      </div>

      {/* Recommendations - Professional "Cards" Layout */}
      <div className="grid gap-4 mt-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <span className="h-px w-4 bg-slate-300"></span>
          Strategic Recommendations
        </h3>

        <AnimatePresence>
          {riskScore?.recommendations?.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mt-1">
                <FiCheckCircle className="text-blue-500 w-4 h-4" />
              </div>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {rec}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isLoading && (
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-center text-xs text-blue-500 font-medium"
        >
          Processing plan data through Risk Model v4.2...
        </motion.div>
      )}
    </div>
  );
}
