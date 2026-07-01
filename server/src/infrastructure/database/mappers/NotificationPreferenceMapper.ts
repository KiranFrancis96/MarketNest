import type { NotificationPreference } from "@/domain/entities/notificationPreference.entity.ts";
import mongoose from "mongoose";

interface INotificationPreferenceDoc {
  _id?: mongoose.Types.ObjectId | string;
  id?: string;
  userId?: mongoose.Types.ObjectId | string;
  pushEnabled?: boolean;
  chatbotEnabled?: boolean;
  marketingEnabled?: boolean;
  orderEnabled?: boolean;
  startHour?: number;
  endHour?: number;
  notificationFrequency?: string;
}

export class NotificationPreferenceMapper {
  static toEntity(doc: unknown): NotificationPreference | null {
    if (!doc) return null;
    const d = doc as INotificationPreferenceDoc;
    return {
      _id: d._id ? d._id.toString() : d.id,
      userId: d.userId ? d.userId.toString() : "",
      pushEnabled: d.pushEnabled !== false,
      chatbotEnabled: d.chatbotEnabled !== false,
      marketingEnabled: d.marketingEnabled !== false,
      orderEnabled: d.orderEnabled !== false,
      startHour: typeof d.startHour === "number" ? d.startHour : 9,
      endHour: typeof d.endHour === "number" ? d.endHour : 21,
      notificationFrequency: d.notificationFrequency || "IMMEDIATE",
    };
  }

  static toDocument(entity: NotificationPreference): Record<string, unknown> {
    return {
      userId: entity.userId,
      pushEnabled: entity.pushEnabled,
      chatbotEnabled: entity.chatbotEnabled,
      marketingEnabled: entity.marketingEnabled,
      orderEnabled: entity.orderEnabled,
      startHour: entity.startHour,
      endHour: entity.endHour,
      notificationFrequency: entity.notificationFrequency,
    };
  }
}
