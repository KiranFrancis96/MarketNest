import mongoose from "mongoose";
import { UserModel } from "./infrastructure/database/models/user.model.ts";
import { MerchantModel } from "./infrastructure/database/models/merchant.model.ts";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("DB Connected!");

  const users = await UserModel.find({});
  console.log("USERS IN DB:", users.map(u => ({
    id: u._id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    isAdmin: u.isAdmin,
    isVerified: u.isVerified,
    isBlocked: u.isBlocked
  })));

  const merchants = await MerchantModel.find({});
  console.log("MERCHANTS IN DB:", merchants.map(m => ({
    id: m._id,
    businessName: m.businessName,
    ownerName: m.ownerName,
    email: m.email,
    status: m.status,
    isBlocked: m.isBlocked
  })));

  const admin = await UserModel.findOne({ isAdmin: true });
  if (!admin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const newAdmin = await UserModel.create({
      firstName: "System",
      lastName: "Admin",
      email: "admin@marketnest.com",
      password: hashedPassword,
      isAdmin: true,
      isVerified: true
    });
    console.log("Created default admin:", newAdmin);
  } else {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    admin.password = hashedPassword;
    await admin.save();
    console.log("Reset existing admin password to admin123");
  }

  await mongoose.disconnect();
}

run().catch(console.error);
