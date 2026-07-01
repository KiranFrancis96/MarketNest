import type { Notification } from "@/domain/entities/notification.entity.ts";
import mongoose from "mongoose";

interface INotificationDoc {
  _id?: mongoose.Types.ObjectId | string;
  id?: string;
  userId?: mongoose.Types.ObjectId | string;
  title?: string;
  message?: string;
  type?: string;
  data?: Record<string, unknown>;
  isRead?: boolean;
  createdAt?: Date;
  readAt?: Date;
}

export class NotificationMapper {
  static toEntity(doc: unknown): Notification | null {
    if (!doc) return null;
    const d = doc as INotificationDoc;
    return {
      _id: d._id ? d._id.toString() : d.id,
      userId: d.userId ? d.userId.toString() : "",
      title: d.title || "",
      message: d.message || "",
      type: d.type || "SYSTEM",
      data: d.data,
      isRead: !!d.isRead,
      createdAt: d.createdAt,
      readAt: d.readAt,
    };
  }

  static toDocument(entity: Notification): Record<string, unknown> {
    return {
      userId: entity.userId,
      title: entity.title,
      message: entity.message,
      type: entity.type,
      data: entity.data,
      isRead: entity.isRead,
      readAt: entity.readAt,
    };
  }
}
