import { BaseRepository } from "./BaseRepository.ts";
import type { INotificationRepository } from "@/domain/interface/notification.repository.ts";
import type { Notification } from "@/domain/entities/notification.entity.ts";
import { NotificationModel } from "../models/notification.model.ts";
import { NotificationMapper } from "../mappers/NotificationMapper.ts";

export class NotificationRepository extends BaseRepository<Notification> implements INotificationRepository {
  constructor() {
    super(NotificationModel, NotificationMapper);
  }

  async findByUser(userId: string): Promise<Notification[]> {
    const docs = await this.model.find({ userId }).sort({ createdAt: -1 }).lean();
    return docs.map((doc) => this.mapper.toEntity(doc) as Notification);
  }

  async findUnread(userId: string): Promise<Notification[]> {
    const docs = await this.model.find({ userId, isRead: false }).sort({ createdAt: -1 }).lean();
    return docs.map((doc) => this.mapper.toEntity(doc) as Notification);
  }

  async markAsRead(id: string): Promise<Notification | null> {
    const doc = await this.model.findByIdAndUpdate(
      id,
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    ).lean();
    return doc ? (this.mapper.toEntity(doc) as Notification) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }
}
