import type { IUpdateNotificationPreferencesUseCase } from "@/application/IUseCases/notification/INotificationUseCases.ts";
import type { NotificationPreference } from "@/domain/entities/notificationPreference.entity.ts";
import type { NotificationPreferenceInputDto } from "@/application/dtos/notification/NotificationDtos.ts";
import type { NotificationService } from "@/application/services/NotificationService.ts";

export class UpdateNotificationPreferencesUseCase implements IUpdateNotificationPreferencesUseCase {
  constructor(private _notificationService: NotificationService) {}

  async execute(userId: string, input: NotificationPreferenceInputDto): Promise<NotificationPreference> {
    return this._notificationService.updatePreferences(userId, input);
  }
}
