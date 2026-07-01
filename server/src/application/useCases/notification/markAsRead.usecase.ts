import type { IMarkNotificationAsReadUseCase } from "@/application/IUseCases/notification/INotificationUseCases.ts";
import type { Notification } from "@/domain/entities/notification.entity.ts";
import type { NotificationService } from "@/application/services/NotificationService.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import {
  MSG_NOTIFICATION_NOT_FOUND,
  MSG_NOTIFICATION_MODIFY_DENIED,
  MSG_NOTIFICATION_MARK_FAILED,
} from "@/presentation/http/controllers/messages.constants.ts";

export class MarkNotificationAsReadUseCase implements IMarkNotificationAsReadUseCase {
  constructor(private _notificationService: NotificationService) {}

  async execute(userId: string, notificationId: string): Promise<Notification> {
    const notification = await this._notificationService.findById(notificationId);
    
    if (!notification) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_NOTIFICATION_NOT_FOUND);
    }

    if (notification.userId.toString() !== userId) {
      throw new ApiError(HttpStatus.FORBIDDEN, MSG_NOTIFICATION_MODIFY_DENIED);
    }

    const updated = await this._notificationService.markAsRead(notificationId);
    if (!updated) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_NOTIFICATION_MARK_FAILED);
    }

    return updated;
  }
}
