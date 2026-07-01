import type { IUserRepository } from "@/domain/interface/user.repository.ts";
import { OTP_CONFIG } from "@/config/otp.config.ts";
import type { IUserForgotPasswordUseCase } from "@/application/IUseCases/user/IUserUseCases.ts";
import type { UserForgotPasswordInputDTO } from "@/application/dtos/user/UserDtos.ts";
import { generateOtp } from "@/utils/generateOtp.ts";
import { sendOtpEmail } from "@/infrastructure/services/otp.service.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import logger from "@/utils/logger.ts";
import {
  MSG_USER_NOT_FOUND,
  MSG_OTP_EMAIL_FAILED_RESET,
  LOG_OTP_EMAIL_FAILED_RESET,
} from "./messages.constants.ts";

export class UserForgotPasswordUseCase implements IUserForgotPasswordUseCase {
  constructor(private _userRepository: IUserRepository) {}

  async execute({ email }: UserForgotPasswordInputDTO): Promise<void> {
    const user = await this._userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_USER_NOT_FOUND);
    }

    const otp = generateOtp();
    logger.info(`Forgot password OTP for ${email}: ${otp}`);

    await this._userRepository.update(
      {
        otp,
        otpExpiresAt: new Date(Date.now() + OTP_CONFIG.EXPIRY_MS), // 10 minutes
      },
      email
    );

    try {
      await sendOtpEmail(email, otp);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(err, LOG_OTP_EMAIL_FAILED_RESET);
      throw new ApiError(HttpStatus.BAD_GATEWAY, MSG_OTP_EMAIL_FAILED_RESET);
    }
  }
}
