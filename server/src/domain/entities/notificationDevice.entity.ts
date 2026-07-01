export interface NotificationDevice {
  _id?: string;
  userId: string;
  deviceToken: string;
  browser?: string;
  platform?: string;
  lastActive: Date;
  createdAt?: Date;
}
