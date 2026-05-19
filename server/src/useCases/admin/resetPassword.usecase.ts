import { AdminRepository } from "@/infrastructure/repositories/admin.repository.impl.ts";
import { ApiError } from "@/utils/apiError.ts";
import bcrypt from "bcrypt";
import {
  MSG_ADMIN_NOT_FOUND,
  MSG_ADMIN_INVALID_OTP,
} from "./messages.constants.ts";

const repo = new AdminRepository();

export const resetPassword = async (email: string, otp: string, password: string) => {
  const admin = await repo.findByEmail(email);

  if (!admin || !admin.isAdmin) {
    throw new ApiError(404, MSG_ADMIN_NOT_FOUND);
  }

  if (admin.otp !== otp || !admin.otpExpires || admin.otpExpires < new Date()) {
    throw new ApiError(400, MSG_ADMIN_INVALID_OTP);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await repo.update(email, {
    password: hashedPassword,
    otp: undefined,
    otpExpires: undefined,
  });
};
