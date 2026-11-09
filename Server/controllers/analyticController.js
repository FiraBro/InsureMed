import * as analyticsService from "../services/analyticService.js";
// controllers/analytics.controller.js
export const getAdminAnalytics = async (req, res) => {
  try {
    const data = await analyticsService.getFinancialAnalytics();

    // Now 'data' contains profitability, funnel, riskDistribution, etc. directly
    const profitability = data.profitability?.[0] || {
      totalPremium: 0,
      policyCount: 0,
    };

    // Calculate total payout from claimsTrend
    const totalPayout =
      data.claimsTrend?.reduce((acc, curr) => acc + curr.payout, 0) || 0;

    // Loss Ratio Calculation
    const lossRatio =
      profitability.totalPremium > 0
        ? ((totalPayout / profitability.totalPremium) * 100).toFixed(1)
        : 0;

    // Construct the final enterprise response
    res.status(200).json({
      success: true,
      data: {
        ...data,
        profitability: {
          ...profitability,
          lossRatio: parseFloat(lossRatio),
        },
        totalPayout, // Helpful for the frontend
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. NEW: Global Search Controller
export const handleGlobalSearch = async (req, res) => {
  try {
    const { q } = req.query;

    // Safety check for empty or short queries
    if (!q || q.trim().length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Call the service logic we wrote in the previous step
    const results = await analyticsService.globalSearch(req, res);

    /**
     * NOTE: If your service function uses res.status().json(),
     * it will send the response from there.
     * If your service only RETURNS the data, use:
     * res.status(200).json({ success: true, data: results });
     */
  } catch (error) {
    console.error("Global Search Controller Error:", error);
    res.status(500).json({ success: false, message: "Search failed" });
  }
};
