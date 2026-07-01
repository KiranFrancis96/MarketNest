import { BaseRepository } from "./BaseRepository.ts";
import type { INotificationDeviceRepository } from "@/domain/interface/notificationDevice.repository.ts";
import type { NotificationDevice } from "@/domain/entities/notificationDevice.entity.ts";
import { NotificationDeviceModel } from "../models/notificationDevice.model.ts";
import { NotificationDeviceMapper } from "../mappers/NotificationDeviceMapper.ts";

export class NotificationDeviceRepository extends BaseRepository<NotificationDevice> implements INotificationDeviceRepository {
  constructor() {
    super(NotificationDeviceModel, NotificationDeviceMapper);
  }

  async registerDevice(
    userId: string,
    deviceToken: string,
    browser?: string,
    platform?: string
  ): Promise<NotificationDevice | null> {
    const doc = await this.model.findOneAndUpdate(
      { userId, deviceToken },
      { $set: { browser, platform, lastActive: new Date() } },
      { upsert: true, new: true }
    ).lean();
    return doc ? (this.mapper.toEntity(doc) as NotificationDevice) : null;
  }

  async removeDevice(userId: string, deviceToken: string): Promise<boolean> {
    const result = await this.model.deleteOne({ userId, deviceToken });
    return result.deletedCount > 0;
  }

  async findByUser(userId: string): Promise<NotificationDevice[]> {
    const docs = await this.model.find({ userId }).sort({ lastActive: -1 }).lean();
    return docs.map((doc) => this.mapper.toEntity(doc) as NotificationDevice);
  }
}
