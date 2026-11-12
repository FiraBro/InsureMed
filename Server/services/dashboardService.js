import user from "../models/user.js";
import Policy from "../models/policy.js";
import Claim from "../models/claim.js";
import Application from "../models/application.js";
import Notification from "../models/notification.js";

export const getUserDashboard = async (userId) => {
  const now = new Date();
  const [policies, recentClaims, notifications, pendingClaims, approvedClaims] =
    await Promise.all([
      Policy.find({ userId, isDeleted: false })
        .populate("planId", "name coverageAmount")
        .sort({ createdAt: -1 })
        .lean(),
      Claim.find({ user: userId, isDeleted: false })
        .sort({ submittedAt: -1 })
        .limit(5)
        .lean(),
      Notification.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
      Claim.countDocuments({ user: userId, isDeleted: false, status: { $in: ["Pending", "pending", "Processing", "processing"] } }),
      Claim.countDocuments({ user: userId, isDeleted: false, status: { $in: ["Approved", "approved"] } }),
    ]);

  const activePolicies = policies.filter((policy) =>
    ["active", "renewed"].includes(String(policy.status).toLowerCase()),
  );
  const upcomingPolicies = activePolicies
    .filter((policy) => policy.endDate && new Date(policy.endDate) >= now)
    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
  const totalCoverage = activePolicies.reduce(
    (sum, policy) => sum + Number(policy.planSnapshot?.coverageAmount ?? policy.planId?.coverageAmount ?? 0),
    0,
  );

  return {
    stats: {
      activePolicies: activePolicies.length,
      pendingClaims,
      approvedClaims,
      totalCoverage,
      nextPayment: upcomingPolicies[0]
        ? { amount: upcomingPolicies[0].premium || 0, dueDate: upcomingPolicies[0].endDate }
        : { amount: 0, dueDate: null },
    },
    policies,
    recentClaims,
    // There is no payment transaction model or payment history endpoint yet.
    recentPayments: [],
    notifications,
  };
};
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

  return { stats: summary, summary, monthlyGrowth, recentActivity };
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

  const totals = stats?.[0]?.totals?.[0] ?? {};

  return {
    totalRevenue: totals.revenue ?? 0,
    activePolicies: totals.count ?? 0,
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
