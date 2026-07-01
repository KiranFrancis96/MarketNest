import type { IPushNotificationProvider } from "@/application/services/pushProvider.interface.ts";
import logger from "@/utils/logger.ts";

export class FirebasePushProvider implements IPushNotificationProvider {
  private _initialized = false;
  private _messaging: any = null;

  constructor() {
    this._initializeFirebase();
  }

  private async _initializeFirebase() {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (!serviceAccountPath) {
      logger.warn("[FirebasePushProvider] FIREBASE_SERVICE_ACCOUNT_PATH not provided. Running in dev mock mode.");
      return;
    }

    try {
      // Dynamic import to avoid runtime crashes if firebase-admin package is not installed
      const admin = await import("firebase-admin");
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
        });
      }
      this._messaging = admin.messaging();
      this._initialized = true;
      logger.info("[FirebasePushProvider] Firebase Admin SDK initialized successfully.");
    } catch (error: any) {
      logger.warn(
        `[FirebasePushProvider] Failed to initialize Firebase Admin SDK: ${error.message}. Running in mock mode.`
      );
    }
  }

  async send(
    token: string,
    payload: { title: string; body: string; data?: Record<string, string> }
  ): Promise<boolean> {
    if (!this._initialized || !this._messaging) {
      logger.info(
        `[Mock Push Sent] Token: ${token} | Title: "${payload.title}" | Body: "${payload.body}" | Data: ${JSON.stringify(
          payload.data || {}
        )}`
      );
      return true;
    }

    try {
      await this._messaging.send({
        token,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data,
      });
      logger.info(`[Push Sent Success] Token: ${token}`);
      return true;
    } catch (error: any) {
      logger.error(error, `[Push Sent Failure] Token: ${token}`);
      return false;
    }
  }

  async sendBulk(
    tokens: string[],
    payload: { title: string; body: string; data?: Record<string, string> }
  ): Promise<{ successCount: number; failureCount: number }> {
    if (tokens.length === 0) {
      return { successCount: 0, failureCount: 0 };
    }

    if (!this._initialized || !this._messaging) {
      logger.info(
        `[Mock Bulk Push Sent] Tokens Count: ${tokens.length} | Title: "${payload.title}" | Body: "${payload.body}"`
      );
      return { successCount: tokens.length, failureCount: 0 };
    }

    try {
      const response = await this._messaging.sendEachForMulticast({
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data,
      });
      logger.info(
        `[Bulk Push Success] Success: ${response.successCount}, Failure: ${response.failureCount}`
      );
      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error: any) {
      logger.error(error, `[Bulk Push Failure]`);
      return { successCount: 0, failureCount: tokens.length };
    }
  }
}
