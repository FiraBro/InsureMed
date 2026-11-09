import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { usePlans } from "@/hooks/usePlan"; // Import your new hook
import {
  Shield,
  Users,
  TrendingUp,
  Zap,
  CheckCircle,
  Clock,
  Building,
  UserCheck,
  GraduationCap,
  Briefcase,
} from "lucide-react";

// Animation Variants (Exact same as your original)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  hover: {
    y: -10,
    scale: 1.02,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

export default function PlansPreview() {
  const navigate = useNavigate();
  const observerTarget = useRef(null);

  // 1. INTEGRATION: Use the public listing with TanStack Query
  const { listPublic } = usePlans();
  const { data, fetchNextPage, hasNextPage, isLoading, isError } = listPublic({
    limit: 6,
  }); // Fetch 6 plans at a time for smooth loading
  console.log("Fetched Plans Data:", data);

  // 2. OPTIMIZATION: Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 },
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  // Original Helper Functions
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
      case "business":
        return Briefcase;
      default:
        return Shield;
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
      default: "from-blue-600 to-indigo-700",
    };
    return colors[colorScheme] || colors.default;
  };

  const handleApply = (planId) => planId && navigate(`/apply/${planId}`);
  const handleDetails = (planId) => planId && navigate(`/plans/${planId}`);

  if (isLoading)
    return <p className="text-center py-12 text-gray-500">Loading plans...</p>;

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
      >
        {/* Header Section (Unchanged) */}
        <div className="text-center mb-12">
          <motion.div
            variants={cardVariants}
            className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full mb-4"
          >
            <Shield className="w-5 h-5" />
            <span className="font-medium">Trusted Insurance Solutions</span>
          </motion.div>
          <motion.h2
            variants={cardVariants}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Popular Insurance Plans
          </motion.h2>
          <motion.p
            variants={cardVariants}
            className="text-lg text-gray-600 max-w-3xl mx-auto"
          >
            Explore our highly-rated coverage options.
          </motion.p>
        </div>

        {/* The Grid (Optimized for your specific data structure) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data?.data?.map((plan) => {
            // Helper Icon and Color logic
            const PlanIcon = getPlanIcon(plan.planType);
            const planColor = getPlanColor(plan.colorScheme);

            return (
              <motion.div
                key={plan._id}
                variants={cardVariants}
                whileHover="hover"
                className="h-full"
              >
                <Card className="relative border border-gray-200 shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
                  {plan.isPopular && (
                    <motion.div
                      className="absolute top-4 right-4 z-10"
                      initial={{ opacity: 0, x: 10 }}
                      variants={{ hover: { opacity: 1, x: 0 } }}
                      transition={{ duration: 0.3 }}
                    >
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 flex items-center gap-1 border-none shadow-md">
                        <TrendingUp className="w-3 h-3" /> Most Popular
                      </Badge>
                    </motion.div>
                  )}

                  <CardContent className="p-6 flex-grow">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-br ${planColor} bg-opacity-10`}
                        >
                          <PlanIcon className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {plan.name}
                          </h3>
                          <p className="text-sm text-gray-500 uppercase tracking-wider">
                            {plan.category || "Standard Plan"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 mb-2 line-clamp-2 text-sm font-medium">
                        Coverage: {plan.coverageAmount}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {plan.maxMembers
                            ? `${plan.maxMembers} Members`
                            : "Individual"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {plan.waitingPeriod || "No Wait"}
                        </span>
                      </div>
                    </div>

                    {plan.features?.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-600" />
                          Key Benefits
                        </h4>
                        <ul className="space-y-2">
                          {plan.features.slice(0, 4).map((f, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-2 text-sm"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-gray-700">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-100 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">
                        {plan.currency === "USD" ? "$" : plan.currency}
                        {plan.premium || 0}
                      </span>
                      <span className="text-gray-500 text-sm">
                        /{plan.premiumFrequency || "month"}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="p-6 pt-0 flex flex-col gap-3">
                    <Button
                      className={`w-full bg-gradient-to-r ${planColor} hover:brightness-110 transition-all text-white py-6 text-base font-semibold`}
                      onClick={() => handleApply(plan._id)}
                    >
                      Apply Now
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={() => handleDetails(plan._id)}
                    >
                      View Plan Details
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* 3. INFINITE SCROLL TARGET */}
        <div ref={observerTarget} className="h-10 mt-10 flex justify-center">
          {hasNextPage && (
            <p className="text-slate-400 text-sm animate-pulse">
              Loading more plans...
            </p>
          )}
        </div>

        <motion.div variants={cardVariants} className="text-center mt-12">
          <Button
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-10 py-6 text-lg transition-colors"
            onClick={() => navigate("/plans")}
          >
            Compare All Plans
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
