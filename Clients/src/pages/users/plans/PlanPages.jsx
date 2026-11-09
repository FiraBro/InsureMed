// PlansPage.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
  Clock,
  Users,
  DollarSign,
  Building,
  UserCheck,
  GraduationCap,
  Heart,
} from "lucide-react";
import { usePlans } from "@/hooks/usePlan";

export default function PlansPage() {
  const [planType, setPlanType] = useState("");
  const [search, setSearch] = useState("");
  const searchTimeout = useRef(null);
  const navigate = useNavigate();

  // --------------------------
  // Use Plans Hook
  // --------------------------
  const { listPublic } = usePlans();
  const plansQuery = listPublic({
    search: search || undefined,
    planType: planType || undefined,
  });

  // Normalize data to always be an array
  const plans = Array.isArray(plansQuery.data)
    ? plansQuery.data
    : plansQuery.data?.data || [];

  const loading = plansQuery.isLoading;
  const error = plansQuery.isError ? plansQuery.error : null;

  // Debounced search
  // --------------------------
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      plansQuery.refetch();
    }, 500);

    return () => clearTimeout(searchTimeout.current);
  }, [search, planType]);

  // --------------------------
  // Navigation
  // --------------------------
  const handleApply = (plan) => navigate(`/apply/${plan._id}`);
  const handleDetails = (planId) => navigate(`/plans/${planId}`);

  // --------------------------
  // Helpers
  // --------------------------
  const getPlanIcon = (planType) => {
    switch ((planType || "").toLowerCase()) {
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

  const getPlanColor = (colorScheme) => {
    const colors = {
      gold: "from-amber-500 to-yellow-500",
      silver: "from-gray-400 to-gray-300",
      blue: "from-blue-500 to-cyan-500",
      green: "from-emerald-500 to-green-500",
      purple: "from-purple-500 to-violet-500",
      indigo: "from-indigo-500 to-blue-500",
      red: "from-red-500 to-pink-500",
      default: "from-blue-500 to-indigo-500",
    };
    return colors[colorScheme] || colors.default;
  };

  // --------------------------
  // Render
  // --------------------------
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full mb-4">
            <Shield className="w-5 h-5" />
            <span className="font-medium">Trusted by Thousands</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Insurance Plans
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Choose from our insurance plans designed to provide comprehensive
            coverage.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-6 justify-center"
        >
          <input
            type="text"
            placeholder="Search plans..."
            className="border border-gray-200 rounded-xl px-4 py-2 w-full sm:w-80 outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select
            value={planType || "all"}
            onValueChange={(value) => setPlanType(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-48 border border-gray-200 rounded-xl bg-white text-gray-700 focus:ring-blue-400 ">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-100">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="group">Group</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
              <SelectItem value="corporate">Corporate</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Plans Grid */}
        {loading ? (
          <p className="text-gray-500 text-center">Loading plans...</p>
        ) : error ? (
          <div className="text-center py-12">
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
          <p className="text-gray-500 text-center py-12">No plans found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const PlanIcon = getPlanIcon(plan.planType);
              const planColor = getPlanColor(plan.colorScheme);

              return (
                <motion.div
                  key={plan._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-[1.02]">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-3 rounded-xl bg-gradient-to-br ${planColor} bg-opacity-10`}
                          >
                            <PlanIcon
                              className={`w-8 h-8 ${
                                planColor
                                  .replace("from-", "text-")
                                  .split(" ")[0]
                              }`}
                            />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {plan.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {plan.category || "General Plan"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 mb-2 line-clamp-2">
                          {plan.coverageAmount}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {plan.maxMembers
                              ? `${plan.maxMembers} Members`
                              : "Individual Plan"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {plan.waitingPeriod || "N/A"}
                          </span>
                        </div>
                      </div>

                      {plan.features && plan.features.length > 0 && (
                        <ul className="space-y-2 mb-6">
                          {plan.features.slice(0, 4).map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-2 text-sm"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-bold text-gray-900 flex items-baseline gap-1">
                                {plan.currency === "USD" ? (
                                  <DollarSign className="inline-block w-6 h-6" />
                                ) : (
                                  plan.currency
                                )}
                                {plan.premium || 0}
                              </span>
                              <span className="text-gray-500">
                                /{plan.premiumFrequency || "month"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              Premium starts from
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-6 pt-0 flex flex-col gap-3">
                      <Button
                        className={`w-full bg-gradient-to-r ${planColor} hover:opacity-90 text-white py-3 text-base font-medium`}
                        onClick={() => handleApply(plan)}
                      >
                        Apply Now
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-gray-300 hover:bg-gray-50"
                        onClick={() => handleDetails(plan._id)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
