import type { IAdminRepository } from "@/domain/interface/admin.repository.ts";
import type { IResetPasswordUseCase } from "@/application/IUseCases/admin/IAdminUseCases.ts";
import type { ResetPasswordInputDTO } from "@/application/dtos/admin/AdminDtos.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import { MSG_ADMIN_NOT_FOUND, MSG_ADMIN_INVALID_OTP, MSG_ADMIN_PASSWORD_REQUIRED } from "./messages.constants.ts";
import bcrypt from "bcrypt";

export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(private _adminRepository: IAdminRepository) {}

  async execute({ email, otp, password }: ResetPasswordInputDTO): Promise<void> {
    if (!password) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_ADMIN_PASSWORD_REQUIRED);
    }

    const admin = await this._adminRepository.findByEmail(email);

    if (!admin || !admin.isAdmin) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_ADMIN_NOT_FOUND);
    }

    if (admin.otp !== otp || !admin.otpExpires || admin.otpExpires < new Date()) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_ADMIN_INVALID_OTP);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await this._adminRepository.update(email, {
      password: hashedPassword,
      otp: undefined,
      otpExpires: undefined,
    });
  }
}
