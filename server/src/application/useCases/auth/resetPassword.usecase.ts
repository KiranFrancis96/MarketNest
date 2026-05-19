import type { IUserRepository } from "@/domain/interface/user.repository.ts";
import type { IUserResetPasswordUseCase } from "@/application/IUseCases/user/IUserUseCases.ts";
import type { UserResetPasswordInputDTO } from "@/application/dtos/user/UserDtos.ts";
import bcrypt from "bcrypt";
import { ApiError } from "@/utils/apiError.ts";
import { MSG_USER_NOT_FOUND, MSG_USER_INVALID_OTP } from "./messages.constants.ts";

export class UserResetPasswordUseCase implements IUserResetPasswordUseCase {
  constructor(private _userRepository: IUserRepository) {}

  async execute({ email, otp, password }: UserResetPasswordInputDTO): Promise<void> {
    if (!password) {
      throw new ApiError(400, "Password is required");
    }

    const user = await this._userRepository.findByEmail(email);
    if (!user) throw new ApiError(404, MSG_USER_NOT_FOUND);

    if (!user.otp || user.otp !== otp || !user.otpExpires || new Date() > user.otpExpires) {
      throw new ApiError(400, MSG_USER_INVALID_OTP);
    }

    const hashed = await bcrypt.hash(password, 10);

    await this._userRepository.update(
      {
        password: hashed,
        otp: undefined,
        otpExpires: undefined,
      },
      email
    );
  }
}
