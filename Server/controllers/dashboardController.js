import * as dashboardService from "../services/dashboardService.js";

export const getAdminOverview = async (req, res) => {
  try {
    const dashboardData = await dashboardService.getDashboardStats();

    res.status(200).json({
      success: true,
      message: "Dashboard data retrieved successfully",
      data: dashboardData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard metrics",
      error: error.message,
    });
  }
};
