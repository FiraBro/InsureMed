import React, { useMemo } from "react";
import {
  FiUsers,
  FiLayers,
  FiAlertCircle,
  FiDollarSign,
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
import { Button } from "@/components/ui/button";
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
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <FiLoader className="animate-spin text-blue-600" size={32} />
          <p className="text-sm text-slate-500">Loading System Data</p>
        </div>
      </div>
    );
  }

  // 2. ERROR STATE
  if (isError) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <FiAlertTriangle size={26} />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">
          Connection Failed
        </h2>
        <p className="max-w-xs text-sm text-slate-500">
          {error.message || "Could not connect to the insurance server."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-8 md:px-8">
      <div className="w-full space-y-6">
        {/* Header */}
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Overview
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Insurance Management System v2.0
            </p>
          </div>
          <div className="flex items-center gap-4">
            {isFetching && (
              <span className="flex items-center gap-2 text-sm text-slate-500">
                <FiRefreshCw className="animate-spin text-blue-600" size={14} />
                Syncing...
              </span>
            )}
            <span className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              System Live
            </span>
          </div>
        </header>

        {/* KPI cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Revenue"
            value={`$${data.summary.totalRevenue}`}
            icon={<FiDollarSign />}
          />
          <KpiCard
            title="Policies"
            value={data.summary.activePolicies}
            icon={<FiLayers />}
          />
          <KpiCard
            title="Pending"
            value={data.summary.pendingApplications}
            icon={<FiAlertCircle />}
          />
          <KpiCard
            title="Users"
            value={data.summary.totalUsers}
            icon={<FiUsers />}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Chart */}
          <Card className="rounded-xl border-slate-200 bg-white shadow-sm lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">
                Monthly Policy Volume
              </CardTitle>
              <Badge
                variant="outline"
                className="rounded-full border-slate-200 bg-slate-50 font-medium text-slate-600 shadow-none"
              >
                2025-2026
              </Badge>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <div className="h-[320px] w-full">
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
                          stopColor="#2563eb"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#2563eb"
                          stopOpacity={0}
                        />
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
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
                        fontSize: "13px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="policies"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPoly)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent claims */}
          <Card className="flex flex-col rounded-xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">
                Recent Claims
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 divide-y divide-slate-100 px-6 py-2">
              {data.recentActivity.map((claim) => (
                <div
                  key={claim._id}
                  className="flex items-center justify-between gap-3 py-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        claim.status === "approved"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {claim.status === "approved" ? (
                        <FiCheckCircle size={16} />
                      ) : (
                        <FiActivity size={16} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-medium text-slate-900">
                        {claim.user.email.split("@")[0]}
                      </h4>
                      <p className="text-xs text-slate-500">
                        ${claim.amount} • Claim ID: ...{claim._id.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      claim.status === "approved"
                        ? "bg-emerald-500"
                        : "bg-amber-400"
                    }`}
                    aria-label={claim.status}
                  />
                </div>
              ))}
            </CardContent>
            <div className="p-6 pt-2">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/all-claims")}
                className="h-10 w-full border-slate-300 text-sm text-blue-700 hover:bg-blue-50 hover:text-blue-700"
              >
                Access All Records
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// KPI Card
function KpiCard({ title, value, icon }) {
  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {React.cloneElement(icon, { size: 20 })}
        </div>
      </CardContent>
    </Card>
  );
}
