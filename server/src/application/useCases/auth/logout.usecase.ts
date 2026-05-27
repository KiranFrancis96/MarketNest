import type { IUserLogoutUseCase } from "@/application/IUseCases/user/IUserUseCases.ts";
import { tokenBlacklistService } from "@/infrastructure/services/tokenBlacklist.service.ts";

export class UserLogoutUseCase implements IUserLogoutUseCase {
  async execute(input?: { accessToken?: string; refreshToken?: string }): Promise<boolean> {
    if (input) {
      const { accessToken, refreshToken } = input;
      if (accessToken) await tokenBlacklistService.blacklistToken(accessToken);
      if (refreshToken) await tokenBlacklistService.blacklistToken(refreshToken);
    }
    return true;
  }
}