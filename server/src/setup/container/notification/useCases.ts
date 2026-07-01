import { notificationService } from "./repositories.ts";
import { RegisterDeviceUseCase } from "@/application/useCases/notification/registerDevice.usecase.ts";
import { GetNotificationsUseCase } from "@/application/useCases/notification/getNotifications.usecase.ts";
import { GetUnreadNotificationsUseCase } from "@/application/useCases/notification/getUnreadNotifications.usecase.ts";
import { MarkNotificationAsReadUseCase } from "@/application/useCases/notification/markAsRead.usecase.ts";
import { DeleteNotificationUseCase } from "@/application/useCases/notification/deleteNotification.usecase.ts";
import { GetNotificationPreferencesUseCase } from "@/application/useCases/notification/getPreferences.usecase.ts";
import { UpdateNotificationPreferencesUseCase } from "@/application/useCases/notification/updatePreferences.usecase.ts";

export const registerDeviceUseCase = new RegisterDeviceUseCase(notificationService);
export const getNotificationsUseCase = new GetNotificationsUseCase(notificationService);
export const getUnreadNotificationsUseCase = new GetUnreadNotificationsUseCase(notificationService);
export const markAsReadUseCase = new MarkNotificationAsReadUseCase(notificationService);
export const deleteNotificationUseCase = new DeleteNotificationUseCase(notificationService);
export const getPreferencesUseCase = new GetNotificationPreferencesUseCase(notificationService);
export const updatePreferencesUseCase = new UpdateNotificationPreferencesUseCase(notificationService);
