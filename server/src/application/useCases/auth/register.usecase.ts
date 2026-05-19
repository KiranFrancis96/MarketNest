import type { IUserRepository } from "@/domain/interface/user.repository.ts";
import type { IUserRegisterUseCase } from "@/application/IUseCases/user/IUserUseCases.ts";
import type { UserRegisterInputDTO } from "@/application/dtos/user/UserDtos.ts";
import bcrypt from "bcrypt";
import { generateOtp } from "@/utils/generateOtp.ts";
import { sendOtpEmail } from "@/infrastructure/services/otp.service.ts";
import logger from "@/utils/logger.ts";
import { ApiError } from "@/utils/apiError.ts";
import {
  MSG_USER_ALREADY_EXISTS,
  MSG_OTP_EMAIL_FAILED,
  LOG_OTP_EMAIL_FAILED,
  MSG_USER_PASSWORD_REQUIRED,
} from "./messages.constants.ts";

export class UserRegisterUseCase implements IUserRegisterUseCase {
  constructor(private _userRepository: IUserRepository) {}

  async execute({ firstName, lastName, email, password }: UserRegisterInputDTO): Promise<void> {
    if (!password) {
      throw new ApiError(400, MSG_USER_PASSWORD_REQUIRED);
    }

    const existing = await this._userRepository.findByEmail(email);
    if (existing?.isVerified) throw new ApiError(409, MSG_USER_ALREADY_EXISTS);

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    logger.info(otp);

    const user = {
      firstName,
      lastName,
      email,
      password: hashed,
      isVerified: false,
      otp,
      otpExpires: new Date(Date.now() + 5 * 60 * 1000),
      isBlocked: false,
    };

    if (existing) {
      await this._userRepository.update(user, email);
    } else {
      await this._userRepository.create(user);
    }

    try {
      await sendOtpEmail(email, otp);
    } catch (error) {
      logger.error(error, LOG_OTP_EMAIL_FAILED);
      throw new ApiError(502, MSG_OTP_EMAIL_FAILED);
    }
  }
}
