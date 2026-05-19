import type { IMerchantLogoutUseCase } from "@/application/IUseCases/merchant/IMerchantUseCases.ts";

export class LogoutMerchantUseCase implements IMerchantLogoutUseCase {
  async execute(): Promise<boolean> {
    return true;
  }
}
