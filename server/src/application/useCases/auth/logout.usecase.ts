import type { IUserLogoutUseCase } from "@/application/IUseCases/user/IUserUseCases.ts";

export class UserLogoutUseCase implements IUserLogoutUseCase {
  async execute(): Promise<boolean> {
    return true;
  }
}