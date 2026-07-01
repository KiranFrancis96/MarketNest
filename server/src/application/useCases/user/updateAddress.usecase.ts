import type { IUserRepository } from "@/domain/interface/user.repository.ts";
import type { UpdateAddressInputDTO } from "@/application/dtos/user/AddressDtos.ts";
import type { User } from "@/domain/entities/user.entity.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import {
  MSG_USER_NOT_FOUND,
  MSG_ADDRESS_NOT_FOUND,
  MSG_ADDRESS_UPDATE_FAILED,
} from "@/presentation/http/controllers/messages.constants.ts";

export class UpdateUserAddressUseCase {
  constructor(private _userRepository: IUserRepository) {}

  async execute(input: UpdateAddressInputDTO): Promise<User> {
    const user = await this._userRepository.findById(input.userId);
    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_USER_NOT_FOUND);
    }

    const addresses = user.addresses || [];
    const addressIndex = addresses.findIndex((addr) => addr._id === input.addressId);
    if (addressIndex === -1) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_ADDRESS_NOT_FOUND);
    }

    const targetAddress = addresses[addressIndex];
    if (input.fullName !== undefined) targetAddress.fullName = input.fullName;
    if (input.phone !== undefined) targetAddress.phone = input.phone;
    if (input.street !== undefined) targetAddress.street = input.street;
    if (input.city !== undefined) targetAddress.city = input.city;
    if (input.state !== undefined) targetAddress.state = input.state;
    if (input.zipCode !== undefined) targetAddress.zipCode = input.zipCode;
    if (input.country !== undefined) targetAddress.country = input.country;

    if (input.isDefault === true) {
      addresses.forEach((addr) => {
        addr.isDefault = false;
      });
      targetAddress.isDefault = true;
    } else if (input.isDefault === false && targetAddress.isDefault) {
      targetAddress.isDefault = false;
      const otherAddr = addresses.find((addr) => addr._id !== input.addressId);
      if (otherAddr) {
        otherAddr.isDefault = true;
      } else {
        targetAddress.isDefault = true;
      }
    }

    user.addresses = addresses;

    const updatedUser = await this._userRepository.updateById(input.userId, user);
    if (!updatedUser) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_ADDRESS_UPDATE_FAILED);
    }

    return updatedUser;
  }
}
