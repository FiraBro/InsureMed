import catchAsync from "../utils/catchAsync.js";
import adminService from "../services/adminService.js";

export const createAdminUser = catchAsync(async (req, res) => {
  const admin = await adminService.createAdmin(req.body);

  res.status(201).json({
    status: "success",
    message: "Admin created successfully",
    data: admin,
  });
});
