import { AdminRepository } from "@/infrastructure/repositories/admin.repository.impl.ts";
import { ApiError } from "@/utils/apiError.ts";
import { generateOtp } from "@/utils/generateOtp.ts";
import { sendOtpEmail } from "@/infrastructure/services/otp.service.ts";

const repo = new AdminRepository();

export const resendAdminOtp = async (email: string) => {
  const admin = await repo.findByEmail(email);

  if (!admin || !admin.isAdmin) {
    throw new ApiError(404, "Admin not found");
  }

  const otp = generateOtp();
  await repo.update(email, {
    otp,
    otpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });

  await sendOtpEmail(email, otp);
};
