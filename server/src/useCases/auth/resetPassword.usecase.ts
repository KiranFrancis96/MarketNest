import bcrypt from "bcrypt";
import { UserRepository } from "@/infrastructure/repositories/user.repository.impl.ts";
import { ApiError } from "@/utils/apiError.ts";

const repo = new UserRepository();

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  const user = await repo.findByEmail(email);
  if (!user) throw new ApiError(404, "User not found");

  if (!user.otp || user.otp !== otp || !user.otpExpires || new Date() > user.otpExpires) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await repo.update(
    { 
      password: hashed,
      otp: null as any, 
      otpExpires: null as any 
    },
    email
  );
};
