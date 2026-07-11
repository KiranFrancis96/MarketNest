import { BaseRepository } from "./BaseRepository.ts";
import type { INotificationPreferenceRepository } from "@/domain/interface/notificationPreference.repository.ts";
import type { NotificationPreference } from "@/domain/entities/notificationPreference.entity.ts";
import { NotificationPreferenceModel } from "../models/notificationPreference.model.ts";
import { NotificationPreferenceMapper } from "../mappers/NotificationPreferenceMapper.ts";

export class NotificationPreferenceRepository extends BaseRepository<NotificationPreference> implements INotificationPreferenceRepository {
  constructor() {
    super(NotificationPreferenceModel, NotificationPreferenceMapper);
  }

  async getPreferences(userId: string): Promise<NotificationPreference | null> {
    const doc = await this.model.findOne({ userId }).lean();
    return doc ? (this.mapper.toEntity(doc) as NotificationPreference) : null;
  }

  async updatePreferences(userId: string, data: Partial<NotificationPreference>): Promise<NotificationPreference | null> {
    const docData = this.mapper.toDocument(data as NotificationPreference);
    
    
    Object.keys(docData).forEach((key) => {
      if (docData[key] === undefined) {
        delete docData[key];
      }
    });

    const doc = await this.model.findOneAndUpdate(
      { userId },
      { $set: docData },
      { upsert: true, new: true }
    ).lean();

    return doc ? (this.mapper.toEntity(doc) as NotificationPreference) : null;
  }
}
