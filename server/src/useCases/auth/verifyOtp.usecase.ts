import { UserRepository } from "@/infrastructure/repositories/user.repository.impl.ts";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/infrastructure/services/jwt.service.ts";
import { ApiError } from "@/utils/apiError.ts";

const repo = new UserRepository();

export const verifyOtp = async (email: string, otp: string) => {
  const user = await repo.findByEmail(email);
  if (!user) throw new ApiError(404, "User not found");

  if (user.otp !== otp || new Date() > user.otpExpires!) {
    throw new ApiError(400, "Invalid or expired OTP");
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
