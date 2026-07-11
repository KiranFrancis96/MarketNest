import type { INotificationRepository } from "@/domain/interface/notification.repository.ts";
import type { INotificationDeviceRepository } from "@/domain/interface/notificationDevice.repository.ts";
import type { INotificationPreferenceRepository } from "@/domain/interface/notificationPreference.repository.ts";
import type { IPushNotificationProvider } from "./pushProvider.interface.ts";
import type { Notification } from "@/domain/entities/notification.entity.ts";
import type { NotificationPreference } from "@/domain/entities/notificationPreference.entity.ts";
import logger from "@/utils/logger.ts";

export class NotificationService {
  constructor(
    private _notificationRepository: INotificationRepository,
    private _deviceRepository: INotificationDeviceRepository,
    private _preferenceRepository: INotificationPreferenceRepository,
    private _pushProvider: IPushNotificationProvider
  ) {}

  
  private _isWithinActiveHours(currentHour: number, start: number, end: number): boolean {
    if (start === end) return true; 
    if (start < end) {
      return currentHour >= start && currentHour < end;
    } else {
      return currentHour >= start || currentHour < end;
    }
  }


  private _isNotificationTypeEnabled(type: string, preferences: NotificationPreference): boolean {
    switch (type) {
      case "CHATBOT_PROMPT":
        return preferences.chatbotEnabled;
      case "PRODUCT_RECOMMENDATION":
        return preferences.marketingEnabled;
      case "ORDER_UPDATE":
      case "PAYMENT_SUCCESS":
        return preferences.orderEnabled;
      case "MERCHANT_MESSAGE":
      case "SYSTEM":
      case "ADMIN":
      default:
        return true; 
    }
  }

  
  async send(
    userId: string,
    title: string,
    message: string,
    type: string,
    data?: Record<string, unknown>
  ): Promise<Notification | null> {
    
    const notification = await this._notificationRepository.create({
      userId,
      title,
      message,
      type,
      data,
      isRead: false,
    });

    if (!notification) {
      logger.error(`[NotificationService] Failed to save notification for user: ${userId}`);
      return null;
    }

    logger.info(`[NotificationService] Saved notification: ${notification._id} for user: ${userId}`);

    
    let preferences = await this._preferenceRepository.getPreferences(userId);
    if (!preferences) {
      
      preferences = await this._preferenceRepository.updatePreferences(userId, {
        pushEnabled: true,
        chatbotEnabled: true,
        marketingEnabled: true,
        orderEnabled: true,
        startHour: 9,
        endHour: 21,
        notificationFrequency: "IMMEDIATE",
      });
    }

    if (!preferences) {
      logger.warn(`[NotificationService] Could not resolve preferences for user: ${userId}. Skipping push.`);
      return notification;
    }

    
    if (!preferences.pushEnabled) {
      logger.info(`[NotificationService] Push disabled for user: ${userId}. Saved to DB only.`);
      return notification;
    }

    if (!this._isNotificationTypeEnabled(type, preferences)) {
      logger.info(`[NotificationService] Type "${type}" disabled by preferences for user: ${userId}. Saved to DB only.`);
      return notification;
    }

    
    const currentHour = new Date().getHours();
    if (!this._isWithinActiveHours(currentHour, preferences.startHour, preferences.endHour)) {
      logger.info(
        `[NotificationService] Quiet hour active (Current: ${currentHour}, Allowed: ${preferences.startHour}-${preferences.endHour}) for user: ${userId}. Saved to DB only.`
      );
      return notification;
    }

    
    const devices = await this._deviceRepository.findByUser(userId);
    if (devices.length === 0) {
      logger.info(`[NotificationService] No registered devices found for user: ${userId}. Saved to DB only.`);
      return notification;
    }

    
    const payload = {
      title,
      body: message,
      data: data ? Object.entries(data).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}) : undefined,
    };

    const tokens = devices.map((d) => d.deviceToken);
    logger.info(`[NotificationService] Dispatching push to ${tokens.length} devices for user: ${userId}`);
    
    await this._pushProvider.sendBulk(tokens, payload);

    return notification;
  }




  

  
  async sendBulk(
    userIds: string[],
    title: string,
    message: string,
    type: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    logger.info(`[NotificationService] Dispatching bulk notification to ${userIds.length} users.`);
    const promises = userIds.map((userId) => this.send(userId, title, message, type, data));
    await Promise.all(promises);
  }

  
  async getNotifications(userId: string): Promise<Notification[]> {
    return this._notificationRepository.findByUser(userId);
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return this._notificationRepository.findUnread(userId);
  }

  async markAsRead(id: string): Promise<Notification | null> {
    return this._notificationRepository.markAsRead(id);
  }

  async delete(id: string): Promise<boolean> {
    return this._notificationRepository.delete(id);
  }

  async findById(id: string): Promise<Notification | null> {
    return this._notificationRepository.findById(id);
  }

  async registerDevice(
    userId: string,
    deviceToken: string,
    browser?: string,
    platform?: string
  ): Promise<void> {
    await this._deviceRepository.registerDevice(userId, deviceToken, browser, platform);
    logger.info(`[NotificationService] Registered device for user: ${userId}`);
  }

  async getPreferences(userId: string): Promise<NotificationPreference> {
    let preferences = await this._preferenceRepository.getPreferences(userId);
    if (!preferences) {
      preferences = await this._preferenceRepository.updatePreferences(userId, {
        pushEnabled: true,
        chatbotEnabled: true,
        marketingEnabled: true,
        orderEnabled: true,
        startHour: 9,
        endHour: 21,
        notificationFrequency: "IMMEDIATE",
      });
    }
    return preferences!;
  }

  async updatePreferences(userId: string, data: Partial<NotificationPreference>): Promise<NotificationPreference> {
    const updated = await this._preferenceRepository.updatePreferences(userId, data);
    logger.info(`[NotificationService] Updated preferences for user: ${userId}`);
    return updated!;
  }
}
