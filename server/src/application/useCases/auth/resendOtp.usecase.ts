import type { IUserRepository } from "@/domain/interface/user.repository.ts";
import { OTP_CONFIG } from "@/config/otp.config.ts";
import type { IUserResendOtpUseCase } from "@/application/IUseCases/user/IUserUseCases.ts";
import type { UserResendOtpInputDTO } from "@/application/dtos/user/UserDtos.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import { generateOtp } from "@/utils/generateOtp.ts";
import { sendOtpEmail } from "@/infrastructure/services/otp.service.ts";
import { MSG_USER_NOT_FOUND } from "./messages.constants.ts";

export class UserResendOtpUseCase implements IUserResendOtpUseCase {
  constructor(private _userRepository: IUserRepository) {}

  async execute({ email }: UserResendOtpInputDTO): Promise<void> {
    const user = await this._userRepository.findByEmail(email);

    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_USER_NOT_FOUND);
    }

    const otp = generateOtp();
    await this._userRepository.update(
      {
        otp,
        otpExpiresAt: new Date(Date.now() + OTP_CONFIG.EXPIRY_MS), // 10 minutes
      },
      email
    );

    await sendOtpEmail(email, otp);
  }
}
