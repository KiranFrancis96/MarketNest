import type { IUserRepository } from "@/domain/interface/user.repository.ts";
import type { IGetUserProfileUseCase } from "@/application/IUseCases/user/IUserUseCases.ts";
import type { User } from "@/domain/entities/user.entity.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import { MSG_USER_NOT_FOUND } from "./messages.constants.ts";

export class GetUserProfileUseCase implements IGetUserProfileUseCase {
  constructor(private _userRepository: IUserRepository) {}

  async execute(id: string): Promise<User> {
    const user = await this._userRepository.findById(id);
    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_USER_NOT_FOUND);
    }
    return user;
  }
}
