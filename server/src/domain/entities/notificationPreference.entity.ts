export interface NotificationPreference {
  _id?: string;
  userId: string;
  pushEnabled: boolean;
  chatbotEnabled: boolean;
  marketingEnabled: boolean;
  orderEnabled: boolean;
  startHour: number; // 0 to 23
  endHour: number;   // 0 to 23
  notificationFrequency: "IMMEDIATE" | "DAILY" | "WEEKLY" | string;
}
