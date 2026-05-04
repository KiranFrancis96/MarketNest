import { UserRepository } from "@/infrastructure/repositories/user.repository.impl.ts";
import { generateOtp } from "@/utils/generateOtp.ts";
import { sendOtpEmail } from "@/infrastructure/services/otp.service.ts";
import { ApiError } from "@/utils/apiError.ts";
import logger from "@/utils/logger.ts";

const repo = new UserRepository();

export const forgotPassword = async (email: string) => {
  const user = await repo.findByEmail(email);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const otp = generateOtp();
  logger.info(`Forgot password OTP for ${email}: ${otp}`);

  await repo.update(
    {
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
    email
  );

  try {
    await sendOtpEmail(email, otp);
  } catch (error) {
    logger.error(error, "Failed to send OTP email for password reset");
    throw new ApiError(502, "Could not send OTP email. Please try again later.");
  }
};
