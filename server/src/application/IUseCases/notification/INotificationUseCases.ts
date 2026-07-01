import type { Notification } from "@/domain/entities/notification.entity.ts";
import type { NotificationPreference } from "@/domain/entities/notificationPreference.entity.ts";
import type {
  RegisterDeviceInputDto,
  NotificationPreferenceInputDto,
} from "@/application/dtos/notification/NotificationDtos.ts";

export interface IRegisterDeviceUseCase {
  execute(userId: string, input: RegisterDeviceInputDto): Promise<void>;
}

export interface IGetNotificationsUseCase {
  execute(userId: string): Promise<Notification[]>;
}

export interface IGetUnreadNotificationsUseCase {
  execute(userId: string): Promise<Notification[]>;
}

export interface IMarkNotificationAsReadUseCase {
  execute(userId: string, notificationId: string): Promise<Notification>;
}

export interface IDeleteNotificationUseCase {
  execute(userId: string, notificationId: string): Promise<boolean>;
}

export interface IGetNotificationPreferencesUseCase {
  execute(userId: string): Promise<NotificationPreference>;
}

export interface IUpdateNotificationPreferencesUseCase {
  execute(userId: string, input: NotificationPreferenceInputDto): Promise<NotificationPreference>;
}
