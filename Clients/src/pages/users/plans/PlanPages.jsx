// PlansPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  CheckCircle,
  Users,
  DollarSign,
  Building,
  UserCheck,
  GraduationCap,
  Heart,
  Search,
  ChevronDown,
} from "lucide-react";
import { usePlans } from "@/hooks/usePlan";

// Same color palette as before (classes written in full so Tailwind keeps them)
const PLAN_COLORS = {
  gold: {
    gradient: "from-amber-500 to-yellow-500",
    text: "text-amber-600",
    soft: "bg-amber-50",
    ink: "text-white",
  },
  silver: {
    gradient: "from-gray-400 to-gray-300",
    text: "text-gray-600",
    soft: "bg-gray-100",
    ink: "text-gray-900",
  },
  blue: {
    gradient: "from-blue-500 to-cyan-500",
    text: "text-blue-600",
    soft: "bg-blue-50",
    ink: "text-white",
  },
  green: {
    gradient: "from-emerald-500 to-green-500",
    text: "text-emerald-600",
    soft: "bg-emerald-50",
    ink: "text-white",
  },
  purple: {
    gradient: "from-purple-500 to-violet-500",
    text: "text-purple-600",
    soft: "bg-purple-50",
    ink: "text-white",
  },
  indigo: {
    gradient: "from-indigo-500 to-blue-500",
    text: "text-indigo-600",
    soft: "bg-indigo-50",
    ink: "text-white",
  },
  red: {
    gradient: "from-red-500 to-pink-500",
    text: "text-red-600",
    soft: "bg-red-50",
    ink: "text-white",
  },
  default: {
    gradient: "from-blue-500 to-indigo-500",
    text: "text-blue-600",
    soft: "bg-blue-50",
    ink: "text-white",
  },
};

const getPlanColor = (scheme) => PLAN_COLORS[scheme] || PLAN_COLORS.default;

const getPlanIcon = (type) => {
  switch ((type || "").toLowerCase()) {
    case "corporate":
    case "group":
      return Building;
    case "senior":
      return UserCheck;
    case "student":
      return GraduationCap;
    case "family":
      return Users;
    default:
      return Heart;
  }
};

// One shared column template so the header and every row line up on large screens
const COLS =
  "lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)_auto]";

// --------------------------
// One plan row
// --------------------------
function PlanRow({ plan, onApply, onDetails }) {
  const [open, setOpen] = useState(false);
  const Icon = getPlanIcon(plan.planType);
  const color = getPlanColor(plan.colorScheme);
  const features = plan.features || [];

  return (
    <li className="relative bg-white transition-colors hover:bg-gray-50/70">
      <div className={`grid gap-4 px-5 py-4 sm:px-6 lg:items-center ${COLS}`}>
        {/* Plan identity */}
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${color.gradient} ${color.ink}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-gray-900">
              {plan.name}
            </h3>
            <p className="truncate text-sm text-gray-500">
              {plan.category || "General Plan"}
              <span className="text-gray-300"> | </span>
              <span className="capitalize">{plan.planType || "general"}</span>
            </p>
          </div>
        </div>

        {/* Stats: 3 columns on mobile, become grid children on large screens */}
        <div className="grid grid-cols-3 gap-3 lg:contents">
          <div className="min-w-0">
            <p className="text-xs text-gray-500 lg:hidden">Coverage</p>
            <p className="line-clamp-2 text-sm font-medium text-gray-900">
              {plan.coverageAmount || "-"}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 lg:hidden">Members</p>
            <p className="text-sm text-gray-700">
              {plan.maxMembers
                ? `${plan.maxMembers} Members`
                : "Individual Plan"}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 lg:hidden">Waiting period</p>
            <p className="text-sm text-gray-700">
              {plan.waitingPeriod || "N/A"}
            </p>
          </div>
        </div>

        {/* Price */}
        <div>
          <div className="flex items-baseline gap-1">
            <span className="flex items-center text-2xl font-bold tabular-nums text-gray-900">
              {plan.currency === "USD" ? (
                <DollarSign className="-ml-1 h-5 w-5" />
              ) : (
                <span className="mr-1 text-base">{plan.currency}</span>
              )}
              {plan.premium || 0}
            </span>
            <span className="text-sm text-gray-500">
              /{plan.premiumFrequency || "month"}
            </span>
          </div>
          <p className="text-xs text-gray-500">Premium starts from</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            className={`bg-gradient-to-r ${color.gradient} ${color.ink} font-medium hover:opacity-90`}
            onClick={() => onApply(plan)}
          >
            Apply Now
          </Button>
          <Button
            variant="outline"
            className="border-gray-300 hover:bg-gray-50"
            onClick={() => onDetails(plan._id)}
          >
            View Details
          </Button>
        </div>
      </div>

      {/* Benefits toggle */}
      {features.length > 0 && (
        <div className="px-5 pb-3 sm:px-6">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${color.soft} ${color.text} focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400`}
          >
            {open ? "Hide benefits" : `Show ${features.length} benefits`}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <motion.ul
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2 xl:grid-cols-3"
            >
              {features.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                  {feature}
                </li>
              ))}
            </motion.ul>
          )}
        </div>
      )}
    </li>
  );
}

// --------------------------
// Page
// --------------------------
export default function PlansPage() {
  const [planType, setPlanType] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const navigate = useNavigate();

  // Debounce the value; the query refetches by itself when params change
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(t);
  }, [search]);

  const { listPublic } = usePlans();
  const plansQuery = listPublic({
    search: debouncedSearch || undefined,
    planType: planType || undefined,
  });

  const plans = Array.isArray(plansQuery.data)
    ? plansQuery.data
    : plansQuery.data?.data || [];

  const loading = plansQuery.isLoading;
  const error = plansQuery.isError ? plansQuery.error : null;

  const handleApply = (plan) => navigate(`/dashboard/apply/${plan._id}`);
  const handleDetails = (planId) => navigate(`/dashboard/plans/${planId}`);

  return (
    <section className="py-6 sm:py-8">
      <div className="w-full px-4 sm:px-6">
        {/* Header + filters */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
              <Shield className="h-4 w-4" />
              Trusted by Thousands
            </div>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Insurance Plans
            </h2>
            <p className="mt-1 max-w-xl text-sm text-gray-600">
              Choose from our insurance plans designed to provide comprehensive
              coverage.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search plans..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 outline-none transition focus:ring-2 focus:ring-blue-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select
              value={planType || "all"}
              onValueChange={(value) =>
                setPlanType(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-full rounded-xl border border-gray-200 bg-white text-gray-700 focus:ring-blue-400 sm:w-44">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="border-gray-100 bg-white">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="group">Group</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Plans list */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl bg-gray-100"
              />
            ))}
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-red-600">
              {error?.message || "Failed to load plans"}
            </p>
            <Button
              onClick={() => plansQuery.refetch()}
              className="mt-4 bg-red-600 hover:bg-red-700"
            >
              Retry
            </Button>
          </div>
        ) : plans.length === 0 ? (
          <p className="py-12 text-center text-gray-500">No plans found</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {/* Column headers (large screens only) */}
            <div
              className={`hidden gap-4 border-b border-gray-200 bg-gray-50 px-6 py-3 pl-6 text-xs font-medium text-gray-500 lg:grid ${COLS}`}
            >
              <span>Plan</span>
              <span>Coverage</span>
              <span>Members</span>
              <span>Waiting period</span>
              <span>Premium</span>
              <span className="text-right">Actions</span>
            </div>

            <ul className="divide-y divide-gray-100">
              {plans.map((plan) => (
                <PlanRow
                  key={plan._id}
                  plan={plan}
                  onApply={handleApply}
                  onDetails={handleDetails}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
