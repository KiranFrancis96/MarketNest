import type { IGetNotificationsUseCase } from "@/application/IUseCases/notification/INotificationUseCases.ts";
import type { Notification } from "@/domain/entities/notification.entity.ts";
import type { NotificationService } from "@/application/services/NotificationService.ts";

export class GetNotificationsUseCase implements IGetNotificationsUseCase {
  constructor(private _notificationService: NotificationService) {}

  async execute(userId: string): Promise<Notification[]> {
    return this._notificationService.getNotifications(userId);
  }
}
