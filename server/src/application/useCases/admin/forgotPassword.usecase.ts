import type { IAdminRepository } from "@/domain/interface/admin.repository.ts";
import type { IForgotPasswordUseCase } from "@/application/IUseCases/admin/IAdminUseCases.ts";
import type { ForgotPasswordInputDTO } from "@/application/dtos/admin/AdminDtos.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import { generateOtp } from "@/utils/generateOtp.ts";
import { sendOtpEmail } from "@/infrastructure/services/otp.service.ts";
import { MSG_ADMIN_NOT_FOUND } from "./messages.constants.ts";
import { OTP_CONFIG } from "@/config/otp.config.ts";

export class ForgotPasswordUseCase implements IForgotPasswordUseCase {
  constructor(private _adminRepository: IAdminRepository) {}

  async execute({ email }: ForgotPasswordInputDTO): Promise<void> {
    const admin = await this._adminRepository.findByEmail(email);

    if (!admin || !admin.isAdmin) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_ADMIN_NOT_FOUND);
    }

    const otp = generateOtp();
    await this._adminRepository.update(email, {
      otp,
      otpExpires: new Date(Date.now() + OTP_CONFIG.EXPIRY_MS),
    });

    await sendOtpEmail(email, otp);
  }
}
