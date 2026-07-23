import type { IUserProfileRepository } from "@/domain/interface/userProfile.repository.ts";

import type { ICreateUserProfileUseCase } from "@/application/IUseCases/userProfile/IUserProfileUseCases.ts";

import type {
    CreateUserProfileInputDTO,
    CreateUserProfileOutputDTO,
} from "@/application/dtos/userProfile/UserProfileDtos.ts";

import {
    calculateProfileCompletion,
    getNextSection,
} from "@/application/services/profileRewards.ts";

import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";

export class CreateUserProfileUseCase
    implements ICreateUserProfileUseCase {
    constructor(
        private _profileRepository: IUserProfileRepository
    ) { }

    async execute({
        userId,
        basicInformation,
    }: CreateUserProfileInputDTO): Promise<CreateUserProfileOutputDTO> {

        const existing =
            await this._profileRepository.findByUserId(userId);

        if (existing) {
            throw new ApiError(
                HttpStatus.CONFLICT,
                "Profile already exists."
            );
        }


        const initialProfile = {
            userId,

            basicInformation,

            lifestyle: {},

            family: {},

            home: {},

            shopping: {},

            privacy: {},
        };


        const {
            completionPercentage,
            rewardCoins,
            completedSections,
        } = calculateProfileCompletion(initialProfile, [], ["basicInformation"]);


        const profile =
            await this._profileRepository.create({
                ...initialProfile,

                completionPercentage,

                rewardCoins,

                completedSections,

                currentSection: getNextSection(completedSections),
            });

        return {
            profile,
        };
    }
}