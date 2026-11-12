import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import {
  FiArrowUpRight, FiBell, FiClock, FiDollarSign, FiFileText, FiShield,
} from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { fetchUserDashboard } from "@/services/dashboardService";

const EMPTY_DASHBOARD = {
  stats: {
    activePolicies: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    totalCoverage: 0,
    nextPayment: { amount: 0, dueDate: null },
  },
  policies: [],
  recentClaims: [],
  recentPayments: [],
  notifications: [],
};

const currency = (value) => new Intl.NumberFormat(undefined, {
  style: "currency", currency: "USD", maximumFractionDigits: 0,
}).format(Number(value) || 0);

const date = (value) => {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  });
};

const statusClass = (status = "") => {
  const normalized = status.toLowerCase();
  if (["active", "approved", "paid", "renewed"].includes(normalized)) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (["pending", "processing", "pending_renewal"].includes(normalized)) return "border-amber-200 bg-amber-50 text-amber-700";
  if (["rejected", "expired", "cancelled", "failed"].includes(normalized)) return "border-red-200 bg-red-50 text-red-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
};

function StatusBadge({ status }) {
  return <Badge variant="outline" className={`capitalize ${statusClass(status)}`}>{(status || "unknown").replaceAll("_", " ")}</Badge>;
}

function ChartCard({ title, subtitle, children, empty }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="h-64">
        {empty ? <div className="flex h-full items-center justify-center text-sm text-slate-500">No activity to chart yet.</div> : children}
      </div>
    </section>
  );
}

export default function DashboardOverview() {
  const user = useAuthStore((state) => state.user);
  const firstName = user?.fullName?.trim().split(/\s+/)[0] || "there";
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchUserDashboard()
      .then((data) => { if (active) setDashboard({ ...EMPTY_DASHBOARD, ...data, stats: { ...EMPTY_DASHBOARD.stats, ...data?.stats, nextPayment: { ...EMPTY_DASHBOARD.stats.nextPayment, ...data?.stats?.nextPayment } }, policies: Array.isArray(data?.policies) ? data.policies : [], recentClaims: Array.isArray(data?.recentClaims) ? data.recentClaims : [], recentPayments: Array.isArray(data?.recentPayments) ? data.recentPayments : [], notifications: Array.isArray(data?.notifications) ? data.notifications : [] }); })
      .catch((err) => { if (active) setError(err.response?.data?.message || err.message || "Unable to load your dashboard."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const chartData = useMemo(() => {
    const months = new Map();
    const collect = (items, key) => items.forEach((item) => {
      const stamp = item.createdAt || item.submittedAt || item.startDate;
      if (!stamp) return;
      const parsed = new Date(stamp);
      if (Number.isNaN(parsed.getTime())) return;
      const label = parsed.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
      const entry = months.get(label) || { month: label, policies: 0, claims: 0 };
      entry[key] += 1;
      months.set(label, entry);
    });
    collect(dashboard.policies, "policies");
    collect(dashboard.recentClaims, "claims");
    return [...months.values()].slice(-6);
  }, [dashboard.policies, dashboard.recentClaims]);

  const stats = dashboard.stats;
  const statCards = [
    { label: "Active policies", value: loading ? "—" : stats.activePolicies, note: "Across your coverage", icon: FiShield, color: "blue" },
    { label: "Pending claims", value: loading ? "—" : stats.pendingClaims, note: loading ? "Loading claim totals" : `${stats.approvedClaims} approved`, icon: FiFileText, color: "violet" },
    { label: "Total coverage", value: loading ? "—" : currency(stats.totalCoverage), note: "Current insured value", icon: FiDollarSign, color: "emerald" },
    { label: "Next payment", value: loading ? "—" : (stats.nextPayment?.amount ? currency(stats.nextPayment.amount) : "—"), note: stats.nextPayment?.dueDate ? `Due ${date(stats.nextPayment.dueDate)}` : "No payment due", icon: FiClock, color: "amber" },
  ];
  const colorClasses = { blue: "bg-blue-50 text-blue-600", violet: "bg-violet-50 text-violet-600", amber: "bg-amber-50 text-amber-600", emerald: "bg-emerald-50 text-emerald-600" };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-blue-600">Your account</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Welcome back, {firstName}</h1>
          <p className="mt-2 text-slate-500">Here’s an overview of your insurance activity.</p>
        </div>
        <Link to="/dashboard/claims/new" className="inline-flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">File a claim <FiArrowUpRight /></Link>
      </header>

      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <section aria-label="Account statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, note, icon: Icon, color }) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p></div><span className={`rounded-xl p-3 ${colorClasses[color]}`}><Icon size={20} /></span></div>
            <p className="mt-3 text-sm text-slate-500">{note}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="font-semibold text-slate-900">Your policies</h2><p className="mt-1 text-sm text-slate-500">Coverage and renewal details</p></div><Button asChild variant="outline"><Link to="/dashboard/my-policies">View all</Link></Button></div>
        {loading ? <p className="p-6 text-sm text-slate-500">Loading policies…</p> : dashboard.policies.length === 0 ? <div className="p-8 text-center"><p className="text-sm text-slate-500">You don’t have any policies yet.</p><Button asChild className="mt-4 bg-blue-600 hover:bg-blue-700"><Link to="/dashboard/plans">Browse policies</Link></Button></div> : <div className="divide-y divide-slate-100">{dashboard.policies.slice(0, 5).map((policy) => <div key={policy._id || policy.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium text-slate-900">{policy.planId?.name || policy.planSnapshot?.name || policy.planName || "Insurance policy"}</p><p className="mt-1 text-sm text-slate-500">Policy {policy.policyNumber || policy._id || policy.id} · Coverage {currency(policy.planSnapshot?.coverageAmount ?? policy.planId?.coverageAmount ?? policy.coverageAmount)}</p></div><div className="flex items-center gap-3"><span className="text-sm text-slate-500">Renews {date(policy.endDate || policy.renewalDate)}</span><StatusBadge status={policy.status} /></div></div>)}</div>}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Policy activity" subtitle="Policies and claims by month" empty={!loading && chartData.length === 0}>
          {chartData.length > 0 && <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><defs><linearGradient id="policyFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={0.2} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} /><Tooltip /><Area type="monotone" dataKey="policies" stroke="#2563eb" strokeWidth={3} fill="url(#policyFill)" /></AreaChart></ResponsiveContainer>}
        </ChartCard>
        <ChartCard title="Claims submitted" subtitle="Recent claim activity" empty={!loading && chartData.length === 0}>
          {chartData.length > 0 && <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} /><Tooltip /><Bar dataKey="claims" fill="#7c3aed" radius={[6, 6, 0, 0]} maxBarSize={36} /></BarChart></ResponsiveContainer>}
        </ChartCard>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="font-semibold text-slate-900">Recent claims</h2><p className="mt-1 text-sm text-slate-500">Track submitted claims</p></div><Button asChild variant="outline"><Link to="/dashboard/show/claims">View all</Link></Button></div>
        {loading ? <p className="p-6 text-sm text-slate-500">Loading claims…</p> : dashboard.recentClaims.length === 0 ? <div className="p-8 text-center"><p className="text-sm text-slate-500">No claims have been submitted.</p><Button asChild className="mt-4 bg-blue-600 hover:bg-blue-700"><Link to="/dashboard/claims/new">File a claim</Link></Button></div> : <div className="divide-y divide-slate-100">{dashboard.recentClaims.slice(0, 5).map((claim) => <div key={claim._id || claim.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium text-slate-900">{claim.claimType || claim.policyNumber || "Claim"} <span className="font-mono text-xs text-slate-400">#{String(claim.claimNumber || claim._id || claim.id).slice(-8)}</span></p><p className="mt-1 text-sm text-slate-500">Submitted {date(claim.submittedAt || claim.createdAt)} · {currency(claim.amount)}</p></div><StatusBadge status={claim.status} /></div>)}</div>}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><FiDollarSign className="text-emerald-600" /> Recent payments</CardTitle></CardHeader><CardContent className="space-y-3">{loading ? <p className="text-sm text-slate-500">Loading payments…</p> : dashboard.recentPayments.length === 0 ? <p className="text-sm text-slate-500">No payment history is available.</p> : dashboard.recentPayments.map((payment) => <div key={payment._id || payment.id} className="flex items-center justify-between border-b border-slate-100 pb-3"><div><p className="font-medium">{payment.description || payment.policyNumber || "Premium payment"}</p><p className="text-sm text-slate-500">{date(payment.paidAt || payment.createdAt)}</p></div><div className="text-right"><p className="font-semibold">{currency(payment.amount)}</p><StatusBadge status={payment.status} /></div></div>)}</CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><FiBell className="text-amber-500" /> Recent activity</CardTitle></CardHeader><CardContent className="space-y-4">{loading ? <p className="text-sm text-slate-500">Loading activity…</p> : dashboard.notifications.length === 0 ? <div><p className="text-sm text-slate-500">You’re all caught up. No recent updates.</p><Button asChild variant="link" className="px-0"><Link to="/dashboard/notifications">Open notifications</Link></Button></div> : dashboard.notifications.slice(0, 5).map((item) => <div key={item._id || item.id} className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" /><div><p className="text-sm font-medium text-slate-900">{item.title || item.category || "Account update"}</p><p className="text-sm text-slate-500">{item.message || item.description || "There is an update to your account."}</p><p className="mt-1 text-xs text-slate-400">{date(item.createdAt)}</p></div></div>)}</CardContent></Card>
      </div>
    </div>
  );
}
