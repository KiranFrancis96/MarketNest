import bcrypt from "bcrypt";
import { MerchantRepository } from "@/infrastructure/repositories/merchant.repository.impl.ts";
import { ApiError } from "@/utils/apiError.ts";
import {
  MSG_MERCHANT_NOT_FOUND,
  MSG_MERCHANT_INVALID_OTP,
} from "./messages.constants.ts";

const repo = new MerchantRepository();

export const resetMerchantPassword = async (email: string, otp: string, newPassword: string) => {
  const merchant = await repo.findByEmail(email);
  if (!merchant) throw new ApiError(404, MSG_MERCHANT_NOT_FOUND);

  if (!merchant.otp || merchant.otp !== otp || !merchant.otpExpires || new Date() > merchant.otpExpires) {
    throw new ApiError(400, MSG_MERCHANT_INVALID_OTP);
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await repo.update(
    {
      password: hashed,
      otp: null as any,
      otpExpires: null as any,
    },
    email
  );
};
