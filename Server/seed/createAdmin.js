import mongoose from "mongoose";
import User from "../models/user.js";
import dotenv from "dotenv";
dotenv.config(); // load .env

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DB connected");

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD missing in .env");
      process.exit(1);
    }

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const admin = await User.create({
      fullName: "System Admin",
      email: adminEmail,
      password: adminPassword,
      passwordConfirm: adminPassword,
      role: "admin",
    });

    console.log("✅ Admin created:", admin.email);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

createAdmin();
