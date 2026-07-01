import { z } from "zod";

export const RegisterDeviceRequestSchema = z.object({
  body: z.object({
    deviceToken: z.string().min(1, { message: "Device token is required" }),
    browser: z.string().optional(),
    platform: z.string().optional(),
  }),
});

export const UpdatePreferencesRequestSchema = z.object({
  body: z.object({
    pushEnabled: z.boolean().optional(),
    chatbotEnabled: z.boolean().optional(),
    marketingEnabled: z.boolean().optional(),
    orderEnabled: z.boolean().optional(),
    startHour: z.number().min(0).max(23).optional(),
    endHour: z.number().min(0).max(23).optional(),
    notificationFrequency: z.string().optional(),
  }),
});
