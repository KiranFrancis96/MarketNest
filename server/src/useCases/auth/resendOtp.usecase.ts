import { UserModel } from "@/infrastructure/database/user.model.ts";
import { ApiError } from "@/utils/apiError.ts";
import { generateOtp } from "@/utils/generateOtp.ts";
import { sendOtpEmail } from "@/infrastructure/services/otp.service.ts";
import { MSG_USER_NOT_FOUND } from "./messages.constants.ts";

export const resendOtp = async (email: string) => {
  const user = await UserModel.findOne({ email });

  if (!user) {
    throw new ApiError(404, MSG_USER_NOT_FOUND);
  }

  const otp = generateOtp();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();

  await sendOtpEmail(email, otp);
};
