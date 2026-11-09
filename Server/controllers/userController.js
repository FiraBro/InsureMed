// controllers/userController.js
import userService from "../services/userService.js";
import catchAsync from "../utils/catchAsync.js";

class UserController {
  /**
   * Replaces getAllUsers & getUserAnalysis with a single high-performance endpoint
   * Handles pagination, search, and status filtering (applicant vs registered)
   */
  getUsers = catchAsync(async (req, res, next) => {
    // Extract filters from query: ?page=1&limit=10&search=john&status=applicant
    const result = await userService.listUsersAdmin(req.query);

    res.status(200).json({
      status: "success",
      results: result.users.length,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      data: {
        users: result.users,
      },
    });
  });

  getUser = catchAsync(async (req, res, next) => {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({
      status: "success",
      data: { user },
    });
  });

  updateUser = catchAsync(async (req, res, next) => {
    const user = await userService.updateUser(req.params.id, req.body);
    res.status(200).json({
      status: "success",
      data: { user },
    });
  });

  deleteUser = catchAsync(async (req, res, next) => {
    await userService.deleteUser(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  });

  /**
   * If you still need a dedicated "Summary" for a dashboard dashboard
   */
  getUserStatsSummary = catchAsync(async (req, res, next) => {
    // We can reuse the service logic but with limit 0 to just get counts
    const result = await userService.listUsersAdmin({ limit: 1 });

    res.status(200).json({
      status: "success",
      data: {
        totalUsers: result.total,
        // Additional stats can be added to the service Class later
      },
    });
  });
}

export default new UserController();
