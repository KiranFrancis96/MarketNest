import mongoose from "mongoose";

const notificationDeviceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  deviceToken: { type: String, required: true, index: true },
  browser: { type: String },
  platform: { type: String },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure compound index for unique deviceToken per user
notificationDeviceSchema.index({ userId: 1, deviceToken: 1 }, { unique: true });

export const NotificationDeviceModel = mongoose.model("NotificationDevice", notificationDeviceSchema, "notification_devices");
