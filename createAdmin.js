import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

import User from "./models/user.js";

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URL); 
    
    const existingAdmin = await User.findOne({ email: "admin123@gmail.com" });
    if (existingAdmin) {
      console.log("Admin already exists!");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);
    const adminUser = new User({
      email: "admin123@gmail.com",
      firstName: "Super",
      lastName: "Admin",
      password: hashedPassword,
      role: "admin",
      isEmailVerified: true
    });

    await adminUser.save();
    console.log("Default admin account created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();
