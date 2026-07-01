import type { NotificationDevice } from "@/domain/entities/notificationDevice.entity.ts";
import mongoose from "mongoose";

interface INotificationDeviceDoc {
  _id?: mongoose.Types.ObjectId | string;
  id?: string;
  userId?: mongoose.Types.ObjectId | string;
  deviceToken?: string;
  browser?: string;
  platform?: string;
  lastActive?: Date;
  createdAt?: Date;
}

export class NotificationDeviceMapper {
  static toEntity(doc: unknown): NotificationDevice | null {
    if (!doc) return null;
    const d = doc as INotificationDeviceDoc;
    return {
      _id: d._id ? d._id.toString() : d.id,
      userId: d.userId ? d.userId.toString() : "",
      deviceToken: d.deviceToken || "",
      browser: d.browser,
      platform: d.platform,
      lastActive: d.lastActive || new Date(),
      createdAt: d.createdAt,
    };
  }

  static toDocument(entity: NotificationDevice): Record<string, unknown> {
    return {
      userId: entity.userId,
      deviceToken: entity.deviceToken,
      browser: entity.browser,
      platform: entity.platform,
      lastActive: entity.lastActive,
    };
  }
}
