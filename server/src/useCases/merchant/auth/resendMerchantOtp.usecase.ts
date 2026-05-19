import { MerchantRepository } from "@/infrastructure/repositories/merchant.repository.impl.ts";
import { ApiError } from "@/utils/apiError.ts";
import { generateOtp } from "@/utils/generateOtp.ts";
import { sendOtpEmail } from "@/infrastructure/services/otp.service.ts";
import { MSG_MERCHANT_NOT_FOUND } from "./messages.constants.ts";

const repo = new MerchantRepository();

export const resendMerchantOtp = async (email: string) => {
  const merchant = await repo.findByEmail(email);

  if (!merchant) {
    throw new ApiError(404, MSG_MERCHANT_NOT_FOUND);
  }

  const otp = generateOtp();
  await repo.update(
    {
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
    email
  );

  await sendOtpEmail(email, otp);
};
