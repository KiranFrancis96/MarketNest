import type { IUserRepository } from "@/domain/interface/user.repository.ts";
import type { User } from "@/domain/entities/user.entity.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import {
  MSG_USER_NOT_FOUND,
  MSG_ADDRESS_NOT_FOUND,
  MSG_ADDRESS_DELETE_FAILED,
} from "@/presentation/http/controllers/messages.constants.ts";

export class DeleteUserAddressUseCase {
  constructor(private _userRepository: IUserRepository) {}

  async execute(userId: string, addressId: string): Promise<User> {
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_USER_NOT_FOUND);
    }

    const addresses = user.addresses || [];
    const addressIndex = addresses.findIndex((addr) => addr._id === addressId);
    if (addressIndex === -1) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_ADDRESS_NOT_FOUND);
    }

    const targetAddress = addresses[addressIndex];
    const wasDefault = targetAddress.isDefault;

    addresses.splice(addressIndex, 1);

    if (wasDefault && addresses.length > 0) {
      addresses[0].isDefault = true;
    }

    user.addresses = addresses;

    const updatedUser = await this._userRepository.updateById(userId, user);
    if (!updatedUser) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_ADDRESS_DELETE_FAILED);
    }

    return updatedUser;
  }
}
