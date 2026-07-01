import type { IUserRepository } from "@/domain/interface/user.repository.ts";
import type { AddAddressInputDTO } from "@/application/dtos/user/AddressDtos.ts";
import type { User, Address } from "@/domain/entities/user.entity.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import {
  MSG_USER_NOT_FOUND,
  MSG_ADDRESS_ADD_FAILED,
} from "@/presentation/http/controllers/messages.constants.ts";
import mongoose from "mongoose";

export class AddUserAddressUseCase {
  constructor(private _userRepository: IUserRepository) {}

  async execute(input: AddAddressInputDTO): Promise<User> {
    const user = await this._userRepository.findById(input.userId);
    if (!user) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_USER_NOT_FOUND);
    }

    const addresses = user.addresses || [];
    const isFirstAddress = addresses.length === 0;
    const shouldBeDefault = isFirstAddress ? true : !!input.isDefault;

    if (shouldBeDefault) {
      addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const newAddress: Address = {
      _id: new mongoose.Types.ObjectId().toString(),
      fullName: input.fullName,
      phone: input.phone,
      street: input.street,
      city: input.city,
      state: input.state,
      zipCode: input.zipCode,
      country: input.country,
      isDefault: shouldBeDefault,
    };

    addresses.push(newAddress);
    user.addresses = addresses;

    const updatedUser = await this._userRepository.updateById(input.userId, user);
    if (!updatedUser) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_ADDRESS_ADD_FAILED);
    }

    return updatedUser;
  }
}
