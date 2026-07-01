export interface RegisterDeviceInputDto {
  deviceToken: string;
  browser?: string;
  platform?: string;
}

export interface NotificationPreferenceInputDto {
  pushEnabled?: boolean;
  chatbotEnabled?: boolean;
  marketingEnabled?: boolean;
  orderEnabled?: boolean;
  startHour?: number;
  endHour?: number;
  notificationFrequency?: string;
}
