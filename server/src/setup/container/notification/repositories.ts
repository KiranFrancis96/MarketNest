import { NotificationRepository } from "@/infrastructure/database/repositoryImpl/notification.repository.impl.ts";
import { NotificationDeviceRepository } from "@/infrastructure/database/repositoryImpl/notificationDevice.repository.impl.ts";
import { NotificationPreferenceRepository } from "@/infrastructure/database/repositoryImpl/notificationPreference.repository.impl.ts";
import { FirebasePushProvider } from "@/infrastructure/providers/FirebasePushProvider.ts";
import { NotificationService } from "@/application/services/NotificationService.ts";

export const notificationRepository = new NotificationRepository();
export const deviceRepository = new NotificationDeviceRepository();
export const preferenceRepository = new NotificationPreferenceRepository();
export const pushProvider = new FirebasePushProvider();

export const notificationService = new NotificationService(
  notificationRepository,
  deviceRepository,
  preferenceRepository,
  pushProvider
);
