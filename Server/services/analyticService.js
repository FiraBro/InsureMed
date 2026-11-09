import policy from "../models/policy.js";
import claim from "../models/claim.js";
import User from "../models/user.js";
import InsurancePlan from "../models/plan.js";

export const getFinancialAnalytics = async () => {
  const results = await policy.aggregate([
    { $match: { isDeleted: false } },
    {
      $facet: {
        profitability: [
          {
            $group: {
              _id: null,
              totalPremium: { $sum: "$premium" },
              policyCount: { $sum: 1 },
            },
          },
        ],
        riskDistribution: [
          {
            $group: {
              _id: { $ifNull: ["$planSnapshot.planType", "Uncategorized"] },
              premiumVolume: { $sum: "$premium" },
              policyCount: { $sum: 1 },
            },
          },
          {
            $project: {
              category: "$_id",
              premiumVolume: 1,
              policyCount: 1,
              _id: 0,
            },
          },
        ],
        retentionMetrics: [
          {
            $group: {
              _id: { $month: "$createdAt" },
              newPolicies: { $sum: 1 },
              renewals: {
                $sum: { $cond: [{ $gt: ["$renewalCount", 0] }, 1, 0] },
              },
            },
          },
          { $sort: { _id: 1 } },
        ],
        claimsTrend: [
          {
            $lookup: {
              from: claim.collection.name,
              localField: "_id",
              foreignField: "policyId",
              as: "claimsData",
            },
          },
          { $unwind: "$claimsData" },
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $toLower: "$claimsData.status" }, "approved"] },
                  { $eq: ["$claimsData.isDeleted", false] },
                ],
              },
            },
          },
          {
            $group: {
              _id: { $month: { $toDate: "$claimsData.submittedAt" } },
              payout: { $sum: "$claimsData.amount" },
            },
          },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ]);

  const totalUsers = await User.countDocuments();
  const usersWithPolicies = await policy.distinct("user");

  const funnel = {
    totalUsers,
    interested: usersWithPolicies.length,
    activePaid: results[0]?.profitability[0]?.policyCount || 0,
  };

  return {
    ...results[0],
    funnel,
  };
};

export const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(200).json([]);
    }

    const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchRegex = new RegExp(escapedQuery, "i");

    const [users, policies, claims, plans] = await Promise.all([
      User.find({
        $or: [{ fullName: searchRegex }, { email: searchRegex }],
      })
        .limit(4)
        .select("fullName email role"),

      policy
        .find({
          $or: [
            { policyNumber: searchRegex },
            { "planSnapshot.planName": searchRegex },
          ],
          isDeleted: false,
        })
        .limit(4)
        .select("policyNumber planSnapshot premium"),

      claim
        .find({
          $or: [{ claimId: searchRegex }, { status: searchRegex }],
          isDeleted: false,
        })
        .limit(4)
        .select("claimId amount status"),

      // --- FIXED FOR YOUR PLAN MODEL ---
      InsurancePlan.find({
        $or: [
          { name: searchRegex }, // Changed from planName to name
          { planType: searchRegex },
          { category: searchRegex }, // Added category search (e.g., "Health")
          { slug: searchRegex }, // Added slug search
        ],
        isDeleted: false, // Added to match your schema
      })
        .limit(4)
        .select("name planType premium category"), // Selected existing fields
    ]);

    const results = [
      ...users.map((u) => ({
        id: u._id,
        category: "Users",
        title: u.fullName,
        subtitle: u.email,
        badge: u.role,
        link: `/admin/users`,
      })),
      ...policies.map((p) => ({
        id: p._id,
        category: "Policies",
        title: p.policyNumber,
        subtitle: p.planSnapshot?.planName || "Insurance Policy",
        badge: "Active",
        link: `/admin/all-policies`,
      })),
      ...claims.map((c) => ({
        id: c._id,
        category: "Claims",
        title: `Claim: ${c.claimId}`,
        subtitle: `Amount: $${c.amount}`,
        badge: c.status,
        link: `/admin/all-claims`,
      })),
      // --- MAP TO YOUR ACTUAL PLAN FIELDS ---
      ...plans.map((pl) => ({
        id: pl._id,
        category: "Insurance Plans",
        title: pl.name, // Changed from pl.planName
        subtitle: `${pl.category} | ${pl.planType}`,
        badge: `$${pl.premium}`, // Changed from pl.basePrice
        link: `admin/all-plans`,
      })),
    ];

    res.status(200).json(results);
  } catch (error) {
    console.error("Global Search Error:", error);
    res.status(500).json({ message: "Search execution failed" });
  }
};
