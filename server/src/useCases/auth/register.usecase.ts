import bcrypt from "bcrypt";
import { UserRepository } from "@/infrastructure/repositories/user.repository.impl.ts";
import { generateOtp } from "@/utils/generateOtp.ts";
import { sendOtpEmail } from "@/infrastructure/services/otp.service.ts";
import logger from "@/utils/logger.ts";
import { ApiError } from "@/utils/apiError.ts";
import {
  MSG_USER_ALREADY_EXISTS,
  MSG_OTP_EMAIL_FAILED,
  LOG_OTP_EMAIL_FAILED,
} from "./messages.constants.ts";

const repo = new UserRepository();

export const registerUser = async (firstName: string, lastName: string, email: string, password: string) => {
  const existing = await repo.findByEmail(email);
  if (existing?.isVerified) throw new ApiError(409, MSG_USER_ALREADY_EXISTS);

  const hashed = await bcrypt.hash(password, 10);
  const otp = generateOtp();
  logger.info(otp);

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
    logger.error(error, LOG_OTP_EMAIL_FAILED);
    throw new ApiError(502, MSG_OTP_EMAIL_FAILED);
  }
};
