// services/userService.js
import User from "../models/user.js";
import AppError from "../utils/AppError.js";

class UserService {
  async listUsersAdmin(filters) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const search = filters.search || "";
    const status = filters.status || "all";

    const skip = (page - 1) * limit;
    const query = { isDeleted: { $ne: true } };

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "applications",
          localField: "_id",
          foreignField: "userId",
          as: "userApplications",
        },
      },
      {
        $addFields: {
          isApplicant: { $gt: [{ $size: "$userApplications" }, 0] },
        },
      },
      ...(status === "applicant" ? [{ $match: { isApplicant: true } }] : []),
      ...(status === "registered" ? [{ $match: { isApplicant: false } }] : []),
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
          ],
        },
      },
    ];

    const result = await User.aggregate(pipeline);

    // Safely extract data
    const users = result[0]?.data || [];
    const total = result[0]?.metadata[0]?.total || 0;

    return {
      users,
      total,
      totalPages: Math.ceil(total / limit), // Correctly calculates 2 pages for 12 users
      currentPage: page,
    };
  }

  async getUserById(id) {
    const user = await User.findById(id);
    if (!user) throw new AppError("No user found with that ID", 404);
    return user;
  }

  async updateUser(id, data) {
    const user = await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!user) throw new AppError("No user found with that ID", 404);
    return user;
  }

  async deleteUser(id) {
    const user = await User.findByIdAndDelete(id);
    if (!user) throw new AppError("No user found with that ID", 404);
    return user;
  }
}

export default new UserService();
