import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUsers,
  FiLayers,
  FiAlertCircle,
  FiTrendingUp,
  FiDollarSign,
  FiArrowUpRight,
  FiCheckCircle,
  FiActivity,
  FiLoader,
  FiAlertTriangle,
  FiRefreshCw,
} from "react-icons/fi";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// Hooks & UI
import { useDashboard } from "@/hooks/useDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const MONTH_MAP = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function AdminDashboard() {
  const { data, isLoading, isError, error, isFetching } = useDashboard();
  const navigate = useNavigate();

  // Optimized Chart Data Transformation
  const chartData = useMemo(() => {
    return (
      data?.monthlyGrowth?.map((item) => ({
        name: MONTH_MAP[item._id] || `M${item._id}`,
        policies: item.policies,
        revenue: item.revenue || 0,
      })) || []
    );
  }, [data]);

  // 1. LOADING STATE
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <FiLoader className="text-blue-600" size={40} />
          </motion.div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
            Loading System Data
          </p>
        </div>
      </div>
    );
  }

  // 2. ERROR STATE
  if (isError) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-center">
        <div className="p-4 bg-red-50 rounded-full text-red-500 mb-2">
          <FiAlertTriangle size={40} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Connection Failed</h2>
        <p className="text-slate-500 max-w-xs">
          {error.message || "Could not connect to the insurance server."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-manrope">
      {/* Background Sync Indicator */}
      <AnimatePresence>
        {isFetching && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-blue-100"
          >
            <FiRefreshCw className="animate-spin text-blue-600" size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
              Syncing...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-screen-2xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">
              OVERVIEW
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
              Insurance Management System v2.0
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse ml-2" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mr-2">
              System Live
            </span>
          </div>
        </header>

        {/* KPI CARDS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <KpiCard
            title="Revenue"
            value={`$${data.summary.totalRevenue}`}
            icon={<FiDollarSign />}
            color="blue"
          />
          <KpiCard
            title="Policies"
            value={data.summary.activePolicies}
            icon={<FiLayers />}
            color="indigo"
          />
          <KpiCard
            title="Pending"
            value={data.summary.pendingApplications}
            icon={<FiAlertCircle />}
            color="amber"
          />
          <KpiCard
            title="Users"
            value={data.summary.totalUsers}
            icon={<FiUsers />}
            color="emerald"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CHART AREA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-6">
              <CardHeader className="flex flex-row items-center justify-between pb-10">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  Monthly Policy Volume
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-slate-50 text-slate-500 border-none font-bold"
                >
                  2025-2026
                </Badge>
              </CardHeader>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="colorPoly"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 800, fill: "#94a3b8" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 800, fill: "#94a3b8" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "20px",
                        border: "none",
                        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Area
                      type="stepAfter"
                      dataKey="policies"
                      stroke="#3b82f6"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorPoly)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          {/* ACTIVITY FEED */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white h-full overflow-hidden">
              <CardHeader className="p-8">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  Recent Claims
                </CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-6">
                {data.recentActivity.map((claim) => (
                  <div
                    key={claim._id}
                    className="flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-2xl ${
                          claim.status === "approved"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-50 text-slate-400"
                        } group-hover:scale-110 transition-transform`}
                      >
                        {claim.status === "approved" ? (
                          <FiCheckCircle size={18} />
                        ) : (
                          <FiActivity size={18} />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 tracking-tight">
                          {claim.user.email.split("@")[0]}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          ${claim.amount} • Claim ID: ...{claim._id.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`h-2 w-2 rounded-full ${
                        claim.status === "approved"
                          ? "bg-emerald-500"
                          : "bg-amber-400"
                      }`}
                    />
                  </div>
                ))}
              </CardContent>
              <div className="p-8 pt-0">
                <button
                  onClick={() => navigate("/admin/all-claims")} // Navigates to your full list page
                  className="w-full py-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-blue-600 hover:text-white transition-all"
                >
                  Access All Records
                </button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// KPI Card Reusable Component
function KpiCard({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden group hover:shadow-xl hover:shadow-blue-900/5 transition-all">
      <CardContent className="p-8 flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {title}
          </p>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
            {value}
          </h2>
        </div>
        <div
          className={`p-4 rounded-[1.5rem] transition-transform group-hover:rotate-12 ${colors[color]}`}
        >
          {React.cloneElement(icon, { size: 24 })}
        </div>
      </CardContent>
    </Card>
  );
}
