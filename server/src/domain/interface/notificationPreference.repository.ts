import type { IBaseRepository } from "./IBaseRepository.ts";
import type { NotificationPreference } from "../entities/notificationPreference.entity.ts";

export interface INotificationPreferenceRepository extends IBaseRepository<NotificationPreference> {
  getPreferences(userId: string): Promise<NotificationPreference | null>;
  updatePreferences(userId: string, data: Partial<NotificationPreference>): Promise<NotificationPreference | null>;
}
