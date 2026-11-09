import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  FiTrendingUp,
  FiUsers,
  FiPieChart,
  FiFilter,
  FiDollarSign,
} from "react-icons/fi";
import {
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MONTH_MAP = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function EnterpriseAnalytics({ data }) {
  // 1. Sort and Map Retention Data
  const retentionChart = useMemo(() => {
    if (!data?.retentionMetrics) return [];
    return [...data.retentionMetrics]
      .sort((a, b) => a._id - b._id) // Ensure Jan comes before Dec
      .map((m) => ({
        name: MONTH_MAP[m._id] || `Month ${m._id}`,
        New: m.newPolicies,
        Renewals: m.renewals,
      }));
  }, [data]);

  const funnelSteps = [
    {
      label: "Total Market",
      count: data?.funnel?.totalUsers || 0,
      color: "bg-blue-300",
    },
    {
      label: "Interested",
      count: data?.funnel?.interested || 0,
      color: "bg-blue-400",
    },
    {
      label: "Converted",
      count: data?.funnel?.activePaid || 0,
      color: "bg-emerald-500",
    },
  ];

  // Helper for Loss Ratio Color
  const getLossRatioColor = (ratio) => {
    if (ratio > 80) return "text-red-400";
    if (ratio > 60) return "text-amber-400";
    return "text-emerald-400";
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-700">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-3xl border-none shadow-lg bg-slate-900 text-white">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold uppercase opacity-60">
              Loss Ratio
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl font-black">
                {data?.profitability?.lossRatio ?? 0}%
              </span>
              <FiTrendingUp
                className={getLossRatioColor(data?.profitability?.lossRatio)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-lg bg-white">
          <CardContent className="pt-6">
            <p className="text-[10px] font-bold uppercase text-slate-400">
              Total Payout
            </p>
            <div className="flex items-center gap-2 mt-1 text-slate-900">
              <FiDollarSign className="text-red-500 text-2xl" />
              <span className="text-3xl font-black">
                {data?.totalPayout || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 rounded-3xl border-none shadow-lg bg-white p-5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black uppercase text-slate-400">
              Conversion Funnel
            </span>
            <FiFilter className="text-slate-300" />
          </div>
          <div className="flex gap-2">
            {funnelSteps.map((step, i) => {
              const percentage =
                data?.funnel?.totalUsers > 0
                  ? (step.count / data.funnel.totalUsers) * 100
                  : 0;
              return (
                <div key={i} className="flex-1 space-y-2">
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className={`h-full ${step.color}`}
                    />
                  </div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase truncate">
                    {step.label}
                  </p>
                  <p className="text-sm font-black text-slate-800">
                    {step.count}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retention Area Chart */}
        <Card className="rounded-[2rem] border-none shadow-xl bg-white p-6">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
            <FiUsers /> Growth Trend
          </CardTitle>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={retentionChart}>
                <defs>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "15px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "10px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="New"
                  stroke="#3b82f6"
                  fill="url(#colorNew)"
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="Renewals"
                  stroke="#10b981"
                  fill="none"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Risk Distribution Pie Chart */}
        <Card className="rounded-[2rem] border-none shadow-xl bg-white p-6">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
            <FiPieChart /> Risk Portfolio
          </CardTitle>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.riskDistribution || []}
                  dataKey="premiumVolume"
                  nameKey="category"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                >
                  {(data?.riskDistribution || []).map((entry, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "10px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
