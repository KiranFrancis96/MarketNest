export interface IPushNotificationProvider {
  send(
    token: string,
    payload: { title: string; body: string; data?: Record<string, string> }
  ): Promise<boolean>;

  sendBulk(
    tokens: string[],
    payload: { title: string; body: string; data?: Record<string, string> }
  ): Promise<{ successCount: number; failureCount: number }>;
}
