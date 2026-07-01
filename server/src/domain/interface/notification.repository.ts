import type { IBaseRepository } from "./IBaseRepository.ts";
import type { Notification } from "../entities/notification.entity.ts";

export interface INotificationRepository extends IBaseRepository<Notification> {
  findByUser(userId: string): Promise<Notification[]>;
  findUnread(userId: string): Promise<Notification[]>;
  markAsRead(id: string): Promise<Notification | null>;
  delete(id: string): Promise<boolean>;
}
