import { z } from "zod";

export const MerchantRegisterRequestSchema = z.object({
  body: z.object({
    email: z
      .preprocess((v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : v), z.email({ message: "Invalid email" })),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    businessName: z.string().min(1, { message: "Business name is required" }),
    phone: z.string().min(10, { message: "Phone must be at least 10 digits" }),
    gstNumber: z.string().min(15, { message: "GST Number must be 15 characters" }),
    houseName: z.string().min(1, { message: "House name is required" }),
    street: z.string().min(1, { message: "Street is required" }),
    locality: z.string().min(1, { message: "Locality is required" }),
    city: z.string().min(1, { message: "City is required" }),
    state: z.string().min(1, { message: "State is required" }),
    zipCode: z.string().min(6, { message: "Zip Code must be 6 digits" }),
    country: z.string().min(1, { message: "Country is required" }),
    ownerName: z.string().min(1, { message: "Owner name is required" }),
  })
});

export const MerchantVerifyOtpRequestSchema = z.object({
  body: z.object({
    email: z
      .preprocess((v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : v), z.email({ message: "Invalid email" })),
    otp: z.string().min(4, { message: "OTP must be at least 4 digits" }),
  })
});

export const MerchantLoginRequestSchema = z.object({
  body: z.object({
    email: z
      .preprocess((v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : v), z.email({ message: "Invalid email" })),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  })
});

export const MerchantForgotPasswordRequestSchema = z.object({
  body: z.object({
    email: z
      .preprocess((v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : v), z.email({ message: "Invalid email" })),
  })
});

export const MerchantResetPasswordRequestSchema = z.object({
  body: z.object({
    email: z
      .preprocess((v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : v), z.email({ message: "Invalid email" })),
    otp: z.string().min(4, { message: "OTP must be at least 4 digits" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  })
});

export const MerchantResendOtpRequestSchema = z.object({
  body: z.object({
    email: z
      .preprocess((v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : v), z.email({ message: "Invalid email" })),
  })
});

export const MerchantReapplyRequestSchema = z.object({
  body: z.object({
    businessName: z.string().optional(),
    phone: z.string().optional(),
    gstNumber: z.string().optional(),
    houseName: z.string().optional(),
    street: z.string().optional(),
    locality: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
    ownerName: z.string().optional(),
  })
});
