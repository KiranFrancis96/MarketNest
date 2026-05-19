import type { IUserRepository } from "@/domain/interface/user.repository.ts";
import type { IUserLoginUseCase } from "@/application/IUseCases/user/IUserUseCases.ts";
import type { UserLoginInputDTO, UserLoginOutputDTO } from "@/application/dtos/user/UserDtos.ts";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "@/infrastructure/services/jwt.service.ts";
import { ApiError } from "@/utils/apiError.ts";
import {
  MSG_USER_INVALID_CREDENTIALS,
  MSG_USER_NOT_VERIFIED,
  MSG_USER_BLOCKED,
} from "./messages.constants.ts";

export class UserLoginUseCase implements IUserLoginUseCase {
  constructor(private _userRepository: IUserRepository) {}

  async execute({ email, password }: UserLoginInputDTO): Promise<UserLoginOutputDTO> {
    if (!password) {
      throw new ApiError(400, "Password is required");
    }

    const user = await this._userRepository.findByEmail(email);

    if (!user) {
      throw new ApiError(401, MSG_USER_INVALID_CREDENTIALS);
    }

    if (!user.isVerified) {
      throw new ApiError(403, MSG_USER_NOT_VERIFIED);
    }

    if (user.isBlocked) {
      throw new ApiError(403, MSG_USER_BLOCKED);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new ApiError(401, MSG_USER_INVALID_CREDENTIALS);
    }

    const payload = { id: user._id, email: user.email };

    return {
      user,
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }
}
