import user from "../models/user.js";
import Policy from "../models/policy.js";
import Claim from "../models/claim.js";
import Application from "../models/application.js";
export const getDashboardStats = async () => {
  // Use parallel execution for maximum performance
  const [summary, monthlyGrowth, recentActivity] = await Promise.all([
    // 1. KPI Aggregation (Total Counts & Financials)
    getKPISummary(),
    // 2. Monthly Trend for Charts
    getMonthlyTrend(),
    // 3. Activity Feed
    getRecentActivity(),
  ]);

  return { summary, monthlyGrowth, recentActivity };
};

async function getKPISummary() {
  const stats = await Policy.aggregate([
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              revenue: { $sum: "$premium" },
              count: { $sum: 1 },
            },
          },
        ],
        claimStats: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
      },
    },
  ]);

  const userCount = await user.countDocuments({ role: "customer" });
  const pendingApps = await Application.countDocuments({ status: "pending" });

  return {
    totalRevenue: stats[0].totals[0]?.revenue || 0,
    activePolicies: stats[0].totals[0]?.count || 0,
    pendingApplications: pendingApps,
    totalUsers: userCount,
  };
}

async function getMonthlyTrend() {
  return await Policy.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        revenue: { $sum: "$premiumAmount" },
        policies: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
}

async function getRecentActivity() {
  // Fetches the last 5 major events in the system
  return await Claim.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "name email")
    .select("amount status createdAt");
}
