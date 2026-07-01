import { NotificationController } from "@/presentation/http/controllers/notification.controller.ts";
import * as useCases from "./useCases.ts";

export const notificationController = new NotificationController(
  useCases.registerDeviceUseCase,
  useCases.getNotificationsUseCase,
  useCases.getUnreadNotificationsUseCase,
  useCases.markAsReadUseCase,
  useCases.deleteNotificationUseCase,
  useCases.getPreferencesUseCase,
  useCases.updatePreferencesUseCase
);
