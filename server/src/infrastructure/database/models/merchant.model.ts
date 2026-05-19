import mongoose from "mongoose";

const merchantSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  businessName: { type: String, required: true },
  phone: { type: String, required: true },
  gstNumber: { type: String, required: true, unique: true },
  houseName: { type: String, required: true },
  street: { type: String, required: true },
  locality: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  ownerName: { type: String, required: true },
  documentUrl: { type: String }, 
  
  isEmailVerified: { type: Boolean, default: false },
  isAdminVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending" 
  },
  rejectionReason: { type: String },
  
  otp: String,
  otpExpires: Date,
}, { timestamps: true });

export const MerchantModel = mongoose.model("Merchant", merchantSchema, "merchants");
