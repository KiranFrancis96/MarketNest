import bcrypt from "bcrypt";
import { UserRepository } from "@/infrastructure/repositories/user.repository.impl.ts";
import { ApiError } from "@/utils/apiError.ts";
import {
  MSG_USER_NOT_FOUND,
  MSG_USER_INVALID_OTP,
} from "./messages.constants.ts";

const repo = new UserRepository();

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  const user = await repo.findByEmail(email);
  if (!user) throw new ApiError(404, MSG_USER_NOT_FOUND);

  if (!user.otp || user.otp !== otp || !user.otpExpires || new Date() > user.otpExpires) {
    throw new ApiError(400, MSG_USER_INVALID_OTP);
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
