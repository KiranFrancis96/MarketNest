import type { IUserRepository } from "@/domain/interface/user.repository.ts";
import type { IGetUsersUseCase } from "@/application/IUseCases/admin/IAdminUseCases.ts";
import type { User } from "@/domain/entities/user.entity.ts";

export class GetUsersUseCase implements IGetUsersUseCase {
  constructor(private _userRepository: IUserRepository) {}

  async execute(): Promise<User[]> {
    return await this._userRepository.findAll();
  }
}
