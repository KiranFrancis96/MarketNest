import express from "express";
import { notificationController } from "@/setup/container/notification/controllers.ts";
import { authenticate } from "@/middleware/auth.middleware.ts";
import { validate } from "@/middleware/validate.middleware.ts";
import {
  RegisterDeviceRequestSchema,
  UpdatePreferencesRequestSchema,
} from "@/presentation/validators/notification.validator.ts";
import {
  ROUTE_NOTIFICATIONS_REGISTER,
  ROUTE_NOTIFICATIONS,
  ROUTE_NOTIFICATIONS_UNREAD,
  ROUTE_NOTIFICATIONS_READ,
  ROUTE_NOTIFICATIONS_DELETE,
  ROUTE_NOTIFICATION_PREFS,
} from "./routes.constants.ts";

const router = express.Router();


router.post(
  ROUTE_NOTIFICATIONS_REGISTER,
  authenticate,
  validate(RegisterDeviceRequestSchema),
  notificationController.registerDevice
);


router.get(ROUTE_NOTIFICATIONS, authenticate, notificationController.getNotifications);
router.get(ROUTE_NOTIFICATIONS_UNREAD, authenticate, notificationController.getUnreadNotifications);
router.patch(ROUTE_NOTIFICATIONS_READ, authenticate, notificationController.markAsRead);
router.delete(ROUTE_NOTIFICATIONS_DELETE, authenticate, notificationController.delete);


router.get(ROUTE_NOTIFICATION_PREFS, authenticate, notificationController.getPreferences);
router.put(
  ROUTE_NOTIFICATION_PREFS,
  authenticate,
  validate(UpdatePreferencesRequestSchema),
  notificationController.updatePreferences
);

export default router;
