import type { IUserRepository } from "@/domain/interface/user.repository.ts";
import type { IUnblockUserUseCase } from "@/application/IUseCases/admin/IAdminUseCases.ts";
import type { UnblockUserInputDTO } from "@/application/dtos/admin/AdminDtos.ts";

export class UnblockUserUseCase implements IUnblockUserUseCase {
  constructor(private _userRepository: IUserRepository) {}

  async execute({ id }: UnblockUserInputDTO): Promise<void> {
    await this._userRepository.toggleBlockStatus(id, false);
  }
}
