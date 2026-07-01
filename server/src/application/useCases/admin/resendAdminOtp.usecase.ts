import type { IAdminRepository } from "@/domain/interface/admin.repository.ts";
import type { IResendAdminOtpUseCase } from "@/application/IUseCases/admin/IAdminUseCases.ts";
import type { ResendOtpInputDTO } from "@/application/dtos/admin/AdminDtos.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import { generateOtp } from "@/utils/generateOtp.ts";
import { sendOtpEmail } from "@/infrastructure/services/otp.service.ts";
import { MSG_ADMIN_NOT_FOUND } from "./messages.constants.ts";

export class ResendAdminOtpUseCase implements IResendAdminOtpUseCase {
  constructor(private _adminRepository: IAdminRepository) { }

  async execute({ email }: ResendOtpInputDTO): Promise<void> {
    const admin = await this._adminRepository.findByEmail(email);

    if (!admin || !admin.isAdmin) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_ADMIN_NOT_FOUND);
    }

    const otp = generateOtp();
    await this._adminRepository.update(email, {
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOtpEmail(email, otp);
  }
}
