import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FiArrowUpRight, FiClock, FiDollarSign, FiFileText, FiShield } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

const activityData = [
  { month: "Jan", policies: 2, claims: 1 },
  { month: "Feb", policies: 3, claims: 0 },
  { month: "Mar", policies: 2, claims: 2 },
  { month: "Apr", policies: 4, claims: 1 },
  { month: "May", policies: 3, claims: 0 },
  { month: "Jun", policies: 5, claims: 1 },
];

const stats = [
  { label: "Active policies", value: "3", note: "Across your coverage", icon: FiShield, color: "blue" },
  { label: "Open claims", value: "1", note: "Being reviewed", icon: FiFileText, color: "violet" },
  { label: "Upcoming payments", value: "2", note: "Next 30 days", icon: FiClock, color: "amber" },
  { label: "Paid this year", value: "$1,240", note: "Premium payments", icon: FiDollarSign, color: "emerald" },
];

const colorClasses = {
  blue: "bg-blue-50 text-blue-600",
  violet: "bg-violet-50 text-violet-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
};

function ChartCard({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="h-64">{children}</div>
    </section>
  );
}

export default function DashboardOverview() {
  const { user } = useAuthStore();
  const firstName = user?.fullName?.trim().split(/\s+/)[0] || "there";

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-blue-600">Your account</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 text-slate-500">Here’s an overview of your insurance activity.</p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Account in good standing
        </div>
      </header>

      <section aria-label="Account statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, note, icon: Icon, color }) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
              </div>
              <span className={`rounded-xl p-3 ${colorClasses[color]}`}><Icon size={20} /></span>
            </div>
            <p className="mt-3 text-sm text-slate-500">{note}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Policy activity" subtitle="Policies managed over the last six months">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="policyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="policies" stroke="#2563eb" strokeWidth={3} fill="url(#policyFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Claims submitted" subtitle="Recent claim activity">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="claims" fill="#7c3aed" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">Need to review your coverage?</h2>
          <p className="mt-1 text-sm text-slate-600">Visit your policies to see details and renewal dates.</p>
        </div>
        <Link to="/dashboard/my-policies" className="inline-flex items-center gap-1 self-start rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:self-auto">
          View policies <FiArrowUpRight size={16} />
        </Link>
      </section>
    </div>
  );
}
