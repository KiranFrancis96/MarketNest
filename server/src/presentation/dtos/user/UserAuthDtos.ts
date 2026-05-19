import { z } from "zod";

export const UserRegisterRequestSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email: z
      .preprocess((v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : v), z.email({ message: "Invalid email" })),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  })
});

export const UserVerifyOtpRequestSchema = z.object({
  body: z.object({
    email: z
      .preprocess((v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : v), z.email({ message: "Invalid email" })),
    otp: z.string().min(4, { message: "OTP must be at least 4 digits" }),
  })
});

export const UserLoginRequestSchema = z.object({
  body: z.object({
    email: z
      .preprocess((v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : v), z.email({ message: "Invalid email" })),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  })
});

export const UserForgotPasswordRequestSchema = z.object({
  body: z.object({
    email: z
      .preprocess((v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : v), z.email({ message: "Invalid email" })),
  })
});

export const UserResetPasswordRequestSchema = z.object({
  body: z.object({
    email: z
      .preprocess((v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : v), z.email({ message: "Invalid email" })),
    otp: z.string().min(4, { message: "OTP must be at least 4 digits" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  })
});

export const UserResendOtpRequestSchema = z.object({
  body: z.object({
    email: z
      .preprocess((v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : v), z.email({ message: "Invalid email" })),
  })
});
