import bcrypt from "bcrypt";
import { UserRepository } from "@/infrastructure/repositories/user.repository.impl.ts";
import { generateOtp } from "@/utils/generateOtp.ts";
import { sendOtpEmail } from "@/infrastructure/services/otp.service.ts";
import logger from "@/utils/logger.ts";
import { ApiError } from "@/utils/apiError.ts";

const repo = new UserRepository();

export const registerUser = async (firstName: string, lastName: string, email: string, password: string) => {
  const existing = await repo.findByEmail(email);
  if (existing?.isVerified) throw new ApiError(409, "User already exists");

  const hashed = await bcrypt.hash(password, 10);
  const otp = generateOtp();
  logger.info(otp)

  const user = {
    firstName,
    lastName,
    email,
    password: hashed,
    isVerified: false,
    otp,
    otpExpires: new Date(Date.now() + 5 * 60 * 1000),
    isBlocked: false,
  };

  if (existing) {
    await repo.update(user, email);
  } else {
    await repo.create(user);
  }

  try {
    await sendOtpEmail(email, otp);
  } catch (error) {
    logger.error(error, "Failed to send OTP email");
    throw new ApiError(502, "Could not send OTP email. Check your email credentials and try again.");
  }
};
