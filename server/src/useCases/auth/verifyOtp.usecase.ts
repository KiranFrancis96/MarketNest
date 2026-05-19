import { UserRepository } from "@/infrastructure/repositories/user.repository.impl.ts";
import { generateAccessToken, generateRefreshToken } from "@/infrastructure/services/jwt.service.ts";
import { ApiError } from "@/utils/apiError.ts";
import {
  MSG_USER_NOT_FOUND,
  MSG_USER_INVALID_OTP,
} from "./messages.constants.ts";

const repo = new UserRepository();

export const verifyOtp = async (email: string, otp: string) => {
  const user = await repo.findByEmail(email);
  if (!user) throw new ApiError(404, MSG_USER_NOT_FOUND);

  if (user.otp !== otp || new Date() > user.otpExpires!) {
    throw new ApiError(400, MSG_USER_INVALID_OTP);
  }

  await repo.update(
    { isVerified: true },
    email
  );

  const payload = { id: user._id, email: user.email };

  return {
    user: { id: user._id, email: user.email },
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};
