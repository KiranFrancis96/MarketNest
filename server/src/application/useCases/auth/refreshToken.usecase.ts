import { verifyRefreshToken, generateAccessToken } from "@/infrastructure/services/jwt.service.ts";
import type { IUserRefreshTokenUseCase } from "@/application/IUseCases/user/IUserUseCases.ts";
import { tokenBlacklistService } from "@/infrastructure/services/tokenBlacklist.service.ts";
import { ApiError } from "@/utils/apiError.ts";

export class UserRefreshTokenUseCase implements IUserRefreshTokenUseCase {
  async execute(token: string): Promise<string> {
    const isBlacklisted = await tokenBlacklistService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new ApiError(401, "Token is blacklisted");
    }

    const decoded: any = verifyRefreshToken(token);
    return generateAccessToken({ id: decoded.id, email: decoded.email });
  }
}