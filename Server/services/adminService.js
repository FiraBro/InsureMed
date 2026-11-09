import User from "../models/user.js";
import AppError from "../utils/AppError.js";

class AdminService {
  async createAdmin(data) {
    const exists = await User.findOne({ email: data.email });
    if (exists) throw new AppError("Email already used", 400);

    // Let mongoose pre-save hook hash password normally
    const admin = await User.create({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      passwordConfirm: data.password,
      role: "admin",
    });

    return admin;
  }
}

export default new AdminService();
