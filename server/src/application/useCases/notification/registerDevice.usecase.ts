import type { IRegisterDeviceUseCase } from "@/application/IUseCases/notification/INotificationUseCases.ts";
import type { RegisterDeviceInputDto } from "@/application/dtos/notification/NotificationDtos.ts";
import type { NotificationService } from "@/application/services/NotificationService.ts";

export class RegisterDeviceUseCase implements IRegisterDeviceUseCase {
  constructor(private _notificationService: NotificationService) {}

  async execute(userId: string, input: RegisterDeviceInputDto): Promise<void> {
    await this._notificationService.registerDevice(
      userId,
      input.deviceToken,
      input.browser,
      input.platform
    );
  }
}
