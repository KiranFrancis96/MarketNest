import type { IUserRepository } from "@/domain/interface/user.repository.ts";
import type { IUserVerifyOtpUseCase } from "@/application/IUseCases/user/IUserUseCases.ts";
import type { UserVerifyOtpInputDTO, UserVerifyOtpOutputDTO } from "@/application/dtos/user/UserDtos.ts";
import { generateAccessToken, generateRefreshToken } from "@/infrastructure/services/jwt.service.ts";
import { ApiError } from "@/utils/apiError.ts";
import { MSG_USER_NOT_FOUND, MSG_USER_INVALID_OTP } from "./messages.constants.ts";

export class UserVerifyOtpUseCase implements IUserVerifyOtpUseCase {
  constructor(private _userRepository: IUserRepository) {}

  async execute({ email, otp }: UserVerifyOtpInputDTO): Promise<UserVerifyOtpOutputDTO> {
    const user = await this._userRepository.findByEmail(email);
    if (!user) throw new ApiError(404, MSG_USER_NOT_FOUND);

    if (user.otp !== otp || new Date() > user.otpExpires!) {
      throw new ApiError(400, MSG_USER_INVALID_OTP);
    }

    await this._userRepository.update(
      { isVerified: true },
      email
    );

    const payload = { id: user._id, email: user.email };

    return {
      user,
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }
}
