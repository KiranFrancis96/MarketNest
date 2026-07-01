export type NotificationType =
  | "CHATBOT_PROMPT"
  | "PRODUCT_RECOMMENDATION"
  | "ORDER_UPDATE"
  | "PAYMENT_SUCCESS"
  | "MERCHANT_MESSAGE"
  | "SYSTEM"
  | "ADMIN";

export interface Notification {
  _id?: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType | string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt?: Date;
  readAt?: Date;
}
