import React, { useMemo } from "react";
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
import { Card, CardContent, CardTitle } from "@/components/ui/card";

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

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const tooltipStyle = {
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
  fontSize: "13px",
};

const legendStyle = { fontSize: "12px", color: "#475569" };

export default function EnterpriseAnalytics({ data }) {
  // Sort and map retention data
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
      color: "bg-blue-500",
    },
    {
      label: "Converted",
      count: data?.funnel?.activePaid || 0,
      color: "bg-emerald-500",
    },
  ];

  // Helper for loss ratio color
  const getLossRatioColor = (ratio) => {
    if (ratio > 80) return "text-red-600";
    if (ratio > 60) return "text-amber-600";
    return "text-emerald-600";
  };

  return (
    <div className="space-y-6">
      {/* Top stats row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500">Loss Ratio</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-2xl font-semibold tabular-nums text-slate-900">
                {data?.profitability?.lossRatio ?? 0}%
              </span>
              <FiTrendingUp
                className={getLossRatioColor(data?.profitability?.lossRatio)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500">Total Payout</p>
            <div className="mt-1 flex items-center gap-1 text-slate-900">
              <FiDollarSign className="text-red-500" size={20} />
              <span className="text-2xl font-semibold tabular-nums">
                {data?.totalPayout || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Conversion Funnel
            </span>
            <FiFilter className="text-slate-400" />
          </div>
          <div className="flex gap-4">
            {funnelSteps.map((step, i) => {
              const percentage =
                data?.funnel?.totalUsers > 0
                  ? (step.count / data.funnel.totalUsers) * 100
                  : 0;
              return (
                <div key={i} className="flex-1 space-y-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${step.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="truncate text-xs text-slate-500">
                    {step.label}
                  </p>
                  <p className="text-base font-semibold tabular-nums text-slate-900">
                    {step.count}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Retention area chart */}
        <Card className="rounded-xl border-slate-200 bg-white p-6 shadow-sm">
          <CardTitle className="mb-6 flex items-center gap-2 text-base font-semibold text-slate-900">
            <FiUsers className="text-slate-400" /> Growth Trend
          </CardTitle>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={retentionChart}>
                <defs>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={legendStyle} />
                <Area
                  type="monotone"
                  dataKey="New"
                  stroke="#2563eb"
                  fill="url(#colorNew)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="Renewals"
                  stroke="#10b981"
                  fill="none"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Risk distribution pie chart */}
        <Card className="rounded-xl border-slate-200 bg-white p-6 shadow-sm">
          <CardTitle className="mb-6 flex items-center gap-2 text-base font-semibold text-slate-900">
            <FiPieChart className="text-slate-400" /> Risk Portfolio
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
                  paddingAngle={4}
                >
                  {(data?.riskDistribution || []).map((entry, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={legendStyle}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
