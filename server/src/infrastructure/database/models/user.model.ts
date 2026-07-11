import mongoose from "mongoose";
import { OTP_CONFIG } from "@/config/otp.config.ts";

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiresAt: {
    type: Date,
    default: () => new Date(Date.now() + OTP_CONFIG.EXPIRY_MS),
    index: {
      expires: 0
    }
  },
  isBlocked: { type: Boolean, default: false },
  profilePic: { type: String },
  addresses: [addressSchema]
});

export const UserModel = mongoose.model("User", userSchema, "users");