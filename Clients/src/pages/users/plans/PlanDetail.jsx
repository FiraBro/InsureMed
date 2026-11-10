// PlanDetail.jsx
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Building,
  Users,
  GraduationCap,
  UserCheck,
  Heart,
  Star,
  Check,
  DollarSign,
  ArrowLeft,
} from "lucide-react";
import { planService } from "@/services/planService";
import { toast } from "react-toastify";

// Same palette as the plans list (classes written in full for Tailwind)
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

// A fact row with a dotted leader, like a printed spec sheet
function Fact({ label, children }) {
  return (
    <div className="flex items-baseline gap-2 py-2 text-sm">
      <dt className="text-gray-600">{label}</dt>
      <span
        aria-hidden
        className="min-w-4 flex-1 translate-y-[-3px] border-b border-dotted border-gray-300"
      />
      <dd className="text-right font-medium text-gray-900">{children}</dd>
    </div>
  );
}

export default function PlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const fetchPlan = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await planService.getPlanById(id);

        if (isMounted) {
          if (data?.data) {
            setPlan(data.data);
          } else {
            setError("Plan not found.");
          }
        }
      } catch (err) {
        console.error("Plan Detail Fetch Error:", err);

        if (isMounted) {
          setError("Failed to load plan details.");
          toast("Could not find that insurance plan.", {
            toastId: "fetch-error",
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPlan();

    return () => {
      isMounted = false;
      toast.dismiss();
    };
  }, [id]);

  const PlanIcon = useMemo(() => {
    const type = (plan?.planType || "").toLowerCase();
    if (type.includes("corporate") || type.includes("group")) return Building;
    if (type.includes("family")) return Users;
    if (type.includes("student")) return GraduationCap;
    if (type.includes("senior")) return UserCheck;
    return Heart;
  }, [plan]);

  const color = PLAN_COLORS[plan?.colorScheme] || PLAN_COLORS.default;

  const renderStars = (rating = 0) => {
    const value = Number(rating) || 0;
    if (!value) return <span className="text-gray-500">Not rated yet</span>;
    return (
      <span className="inline-flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-gray-600">{value.toFixed(1)}</span>
      </span>
    );
  };

  const goBack = () => navigate("/dashboard/plans");

  if (loading) {
    return (
      <div className="w-full animate-pulse px-4 py-8 sm:px-6">
        <div className="mb-3 h-4 w-24 rounded bg-gray-200" />
        <div className="mb-6 h-10 w-80 max-w-full rounded bg-gray-200" />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-3">
            <div className="h-4 rounded bg-gray-100" />
            <div className="h-4 w-5/6 rounded bg-gray-100" />
            <div className="h-4 w-4/6 rounded bg-gray-100" />
          </div>
          <div className="h-40 rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-600">{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center py-24">
        <p className="text-lg text-gray-600">Plan not found</p>
        <Button
          variant="outline"
          className="mt-6 border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          onClick={goBack}
        >
          Back to Plans
        </Button>
      </div>
    );
  }

  const frequency = plan.premiumFrequency || "month";

  return (
    <section className="w-full px-4 py-6 sm:px-6 sm:py-10">
      <button
        type="button"
        onClick={goBack}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to plans
      </button>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
        {/* Price and apply. First in the DOM so it shows first on mobile. */}
        <aside className="lg:order-2 lg:sticky lg:top-6 lg:self-start">
          <p className="text-sm text-gray-600">Your premium would be</p>
          <p className="mt-1 flex items-baseline gap-1.5 font-serif text-gray-900">
            <span className="flex items-center text-5xl font-bold tabular-nums">
              {plan.currency === "USD" ? (
                <DollarSign className="-ml-1 h-9 w-9" />
              ) : (
                <span className="mr-1.5 text-3xl">{plan.currency}</span>
              )}
              {plan.premium}
            </span>
            <span className="text-lg text-gray-600">a {frequency}</span>
          </p>
          {/* the one place the plan's gradient is used big */}
          <div
            aria-hidden
            className={`mt-3 h-1.5 w-24 rounded-full bg-gradient-to-r ${color.gradient}`}
          />

          <Button
            className={`mt-8 w-full bg-gradient-to-r ${color.gradient} ${color.ink} py-6 text-base font-semibold hover:opacity-90`}
            onClick={() => {
              navigate(`/dashboard/apply/${plan._id}`);
              toast("Redirecting to application form!");
            }}
          >
            Apply for this plan
          </Button>
          <p className="mt-3 text-sm text-gray-500">
            You'll go to the application form next. Nothing is submitted until
            you finish it.
          </p>

          <dl className="mt-10 border-t border-gray-200 pt-4">
            <Fact label="Plan type">
              <span className="capitalize">{plan.planType || "General"}</span>
            </Fact>
            <Fact label="Billing">
              <span className="capitalize">{frequency}</span>
            </Fact>
            <Fact label="Network size">{plan.networkSize || "N/A"}</Fact>
            <Fact label="Claims settled">
              {plan.claimSettlementRatio
                ? `${plan.claimSettlementRatio}%`
                : "N/A"}
            </Fact>
            <Fact label="Member rating">{renderStars(plan.rating)}</Fact>
          </dl>
        </aside>

        {/* Story */}
        <div className="lg:order-1">
          <div
            className={`mb-5 inline-flex items-center gap-2 rounded-full ${color.soft} ${color.text} px-3 py-1 text-sm font-medium`}
          >
            <PlanIcon className="h-4 w-4" />
            <span className="capitalize">
              {plan.planType || "General"} plan
            </span>
          </div>

          <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
            {plan.name}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-700">
            {plan.description ||
              "Comprehensive health coverage that fits your needs."}
          </p>

          <div className="mt-12 max-w-2xl">
            <h2 className="font-serif text-2xl font-semibold text-gray-900">
              What's covered
            </h2>
            <p className="mt-3 leading-7 text-gray-700">
              {plan.coverageAmount || "Full medical coverage included."}
            </p>
          </div>

          {plan.features?.length > 0 && (
            <div className="mt-12">
              <h2 className="font-serif text-2xl font-semibold text-gray-900">
                What you get
              </h2>
              <ul className="mt-5 grid max-w-3xl gap-x-10 gap-y-4 sm:grid-cols-2">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                      <Check
                        className="h-3 w-3 text-green-700"
                        strokeWidth={3}
                      />
                    </span>
                    <span className="leading-6">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
