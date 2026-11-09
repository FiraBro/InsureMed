import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building,
  Users,
  GraduationCap,
  UserCheck,
  Heart,
  Star,
  CheckCircle2,
} from "lucide-react";
import { planService } from "@/services/planService";

import { toast } from "react-toastify"; // ✅ Import toast

export default function PlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Updated Fetch Plan with Cleanup logic
  useEffect(() => {
    // 1. Immediate exit if there is no ID
    if (!id) return;

    let isMounted = true;

    const fetchPlan = async () => {
      try {
        setLoading(true);
        setError(null); // Clear previous errors immediately

        const data = await planService.getPlanById(id);

        if (isMounted) {
          if (data?.data) {
            setPlan(data.data);
          } else {
            // Instead of a hard error, handle "Not Found" gracefully
            setError("Plan not found.");
          }
        }
      } catch (err) {
        // 2. Log exactly what the error is to debug
        console.error("Plan Detail Fetch Error:", err);

        if (isMounted) {
          setError("Failed to load plan details.");
          // Only toast if we are CERTAIN we are still on the page
          toast("Could not find that insurance plan.", {
            toastId: "fetch-error", // Prevents duplicate toasts
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPlan();

    return () => {
      isMounted = false;
      // 3. Clear all toasts when leaving the page to prevent them
      // from showing up on the Home Page
      toast.dismiss();
    };
  }, [id]);

  // Icon Based on Plan Type
  const PlanIcon = useMemo(() => {
    const type = (plan?.planType || "").toLowerCase();
    if (type.includes("corporate") || type.includes("group")) return Building;
    if (type.includes("family")) return Users;
    if (type.includes("student")) return GraduationCap;
    if (type.includes("senior")) return UserCheck;
    return Heart;
  }, [plan]);

  // Stars
  const renderStars = (rating = 0) => (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < Math.floor(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
      <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
    </div>
  );

  // Loading
  if (loading) {
    return (
      <div className="py-20 px-6 max-w-6xl mx-auto">
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded-xl"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Error
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
      <div className="py-24 flex flex-col items-center">
        <div className="border border-gray-200 rounded-2xl p-10 shadow-sm max-w-md w-full bg-white">
          <p className="text-gray-600 text-lg">Plan not found</p>
          <Button
            variant="outline"
            className="mt-6 w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
            onClick={() => navigate("/plans")}
          >
            Back to Plans
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-16 flex flex-col md:flex-row gap-8">
        {/* LEFT SIDEBAR */}
        <Card className="md:col-span-1 shadow-lg border border-gray-200 md:sticky md:top-24 h-fit">
          <CardHeader>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-blue-100">
                <PlanIcon className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-semibold">
                {plan.name}
              </CardTitle>
            </div>
            <p className="text-gray-500 text-sm">{plan.planType}</p>
          </CardHeader>

          <CardContent className="flex flex-col space-y-6">
            <div>
              <p className="text-4xl font-bold text-gray-900">
                {plan.currency === "USD" ? "$" : plan.currency}
                {plan.premium}
              </p>
              <p className="text-gray-500 text-sm">
                /{plan.premiumFrequency || "month"}
              </p>
            </div>

            <div>{renderStars(plan.rating)}</div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Network Size:</span>
                <span className="text-gray-900 font-semibold">
                  {plan.networkSize || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Claim Settlement:</span>
                <span className="text-gray-900 font-semibold">
                  {plan.claimSettlementRatio || "N/A"}%
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                onClick={() => {
                  navigate(`/apply/${plan._id}`);
                  toast("Redirecting to application form!"); // ✅ Toast success
                }}
              >
                Apply Now
              </Button>
              <Button
                variant="outline"
                className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate("/plans")}
              >
                Back to Plans
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT MAIN CONTENT */}
        <Card className="md:w-2/3 shadow-lg border border-gray-200">
          <CardContent className="p-8 space-y-10">
            <section>
              <h2 className="text-xl font-semibold mb-2">About This Plan</h2>
              <p className="text-gray-700 leading-relaxed">
                {plan.description ||
                  "Comprehensive health coverage that fits your needs."}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Coverage</h3>
              <p className="text-gray-700">
                {plan.coverageAmount || "Full medical coverage included."}
              </p>
            </section>

            {plan.features?.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-4">Key Features</h3>
                <ul className="space-y-2 text-gray-700">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
