import type { IDeleteNotificationUseCase } from "@/application/IUseCases/notification/INotificationUseCases.ts";
import type { NotificationService } from "@/application/services/NotificationService.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import {
  MSG_NOTIFICATION_NOT_FOUND,
  MSG_NOTIFICATION_DELETE_DENIED,
} from "@/presentation/http/controllers/messages.constants.ts";

export class DeleteNotificationUseCase implements IDeleteNotificationUseCase {
  constructor(private _notificationService: NotificationService) {}

  async execute(userId: string, notificationId: string): Promise<boolean> {
    const notification = await this._notificationService.findById(notificationId);

    if (!notification) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_NOTIFICATION_NOT_FOUND);
    }

    if (notification.userId.toString() !== userId) {
      throw new ApiError(HttpStatus.FORBIDDEN, MSG_NOTIFICATION_DELETE_DENIED);
    }

    return this._notificationService.delete(notificationId);
  }
}
