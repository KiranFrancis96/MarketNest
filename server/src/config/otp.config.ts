import dotenv from "dotenv";

dotenv.config();

export const OTP_CONFIG = {
  EXPIRY_MINUTES: Number(process.env.OTP_EXPIRY_MINUTES || 10),

  get EXPIRY_MS(): number {
    return this.EXPIRY_MINUTES * 60 * 1000;
  }
};
