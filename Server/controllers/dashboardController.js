import * as dashboardService from "../services/dashboardService.js";

export const getUserOverview = async (req, res, next) => {
  try {
    const dashboardData = await dashboardService.getUserDashboard(req.user.id);
    res.status(200).json({ status: "success", data: dashboardData });
  } catch (error) {
    next(error);
  }
};

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
