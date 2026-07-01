import type { IBaseRepository } from "./IBaseRepository.ts";
import type { NotificationDevice } from "../entities/notificationDevice.entity.ts";

export interface INotificationDeviceRepository extends IBaseRepository<NotificationDevice> {
  registerDevice(
    userId: string,
    deviceToken: string,
    browser?: string,
    platform?: string
  ): Promise<NotificationDevice | null>;
  removeDevice(userId: string, deviceToken: string): Promise<boolean>;
  findByUser(userId: string): Promise<NotificationDevice[]>;
}
