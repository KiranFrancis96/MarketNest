import { verifyRefreshToken, generateAccessToken } from "@/infrastructure/services/jwt.service.ts";
import type { IUserRefreshTokenUseCase } from "@/application/IUseCases/user/IUserUseCases.ts";
import { tokenBlacklistService } from "@/infrastructure/services/tokenBlacklist.service.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import { MSG_TOKEN_BLACKLISTED } from "./messages.constants.ts";

export class UserRefreshTokenUseCase implements IUserRefreshTokenUseCase {
  async execute(token: string): Promise<string> {
    const isBlacklisted = await tokenBlacklistService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_TOKEN_BLACKLISTED);
    }

    const decoded = verifyRefreshToken(token);
    return generateAccessToken({ id: decoded.id as string, email: decoded.email as string });
  }
}