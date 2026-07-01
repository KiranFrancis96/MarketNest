import mongoose from "mongoose";

const notificationPreferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
  pushEnabled: { type: Boolean, default: true },
  chatbotEnabled: { type: Boolean, default: true },
  marketingEnabled: { type: Boolean, default: true },
  orderEnabled: { type: Boolean, default: true },
  startHour: { type: Number, default: 9, min: 0, max: 23 },
  endHour: { type: Number, default: 21, min: 0, max: 23 },
  notificationFrequency: { type: String, default: "IMMEDIATE" }
}, { timestamps: true });

export const NotificationPreferenceModel = mongoose.model("NotificationPreference", notificationPreferenceSchema, "notification_preferences");
