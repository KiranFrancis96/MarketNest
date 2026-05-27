import type { IMerchantLogoutUseCase } from "@/application/IUseCases/merchant/IMerchantUseCases.ts";
import { tokenBlacklistService } from "@/infrastructure/services/tokenBlacklist.service.ts";

export class LogoutMerchantUseCase implements IMerchantLogoutUseCase {
  async execute(input?: { accessToken?: string; refreshToken?: string }): Promise<boolean> {
    if (input) {
      const { accessToken, refreshToken } = input;
      if (accessToken) await tokenBlacklistService.blacklistToken(accessToken);
      if (refreshToken) await tokenBlacklistService.blacklistToken(refreshToken);
    }
    return true;
  }
}
