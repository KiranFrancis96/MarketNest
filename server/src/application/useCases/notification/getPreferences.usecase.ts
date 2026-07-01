import type { IGetNotificationPreferencesUseCase } from "@/application/IUseCases/notification/INotificationUseCases.ts";
import type { NotificationPreference } from "@/domain/entities/notificationPreference.entity.ts";
import type { NotificationService } from "@/application/services/NotificationService.ts";

export class GetNotificationPreferencesUseCase implements IGetNotificationPreferencesUseCase {
  constructor(private _notificationService: NotificationService) {}

  async execute(userId: string): Promise<NotificationPreference> {
    return this._notificationService.getPreferences(userId);
  }
}
