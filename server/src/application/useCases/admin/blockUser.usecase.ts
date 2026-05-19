import type { IUserRepository } from "@/domain/interface/user.repository.ts";
import type { IBlockUserUseCase } from "@/application/IUseCases/admin/IAdminUseCases.ts";
import type { BlockUserInputDTO } from "@/application/dtos/admin/AdminDtos.ts";

export class BlockUserUseCase implements IBlockUserUseCase {
  constructor(private _userRepository: IUserRepository) {}

  async execute({ id }: BlockUserInputDTO): Promise<void> {
    await this._userRepository.toggleBlockStatus(id, true);
  }
}
