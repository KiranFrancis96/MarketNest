import type { IUserProfileRepository } from "@/domain/interface/userProfile.repository.ts";

import type { IGetUserProfileUseCase } from "@/application/IUseCases/userProfile/IUserProfileUseCases.ts";

import type {
    GetUserProfileInputDTO,
} from "@/application/dtos/userProfile/UserProfileDtos.ts";

import type { UserProfile } from "@/domain/entities/userProfile.entity.ts";

import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";

export class GetUserProfileUseCase
    implements IGetUserProfileUseCase {
    constructor(
        private _profileRepository: IUserProfileRepository
    ) { }

    async execute({
        userId,
    }: GetUserProfileInputDTO): Promise<UserProfile> {

        const profile =
            await this._profileRepository.findByUserId(userId);

        if (!profile) {
            throw new ApiError(
                HttpStatus.NOT_FOUND,
                "User Profile not found."
            );
        }

        return profile;
    }
}