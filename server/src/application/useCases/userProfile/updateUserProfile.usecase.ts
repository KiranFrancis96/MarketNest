import type { IUserProfileRepository } from "@/domain/interface/userProfile.repository.ts";
import type { UserProfile } from "@/domain/entities/userProfile.entity.ts";

import type {
    IUpdateUserProfileUseCase,
} from "@/application/IUseCases/userProfile/IUserProfileUseCases.ts";

import type {
    UpdateUserProfileInputDTO,
    UpdateUserProfileOutputDTO,
} from "@/application/dtos/userProfile/UserProfileDtos.ts";

import {
    calculateProfileCompletion,
    getNextSection,
} from "@/application/services/profileRewards.ts";

import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";

export class UpdateUserProfileUseCase
    implements IUpdateUserProfileUseCase {

    constructor(
        private _profileRepository: IUserProfileRepository
    ) { }

    async execute({
        userId,
        basicInformation,
        lifestyle,
        family,
        home,
        occupation,
        shopping,
        technology,
        travel,
        food,
        entertainment,
        aiPreferences,
        privacy,
    }: UpdateUserProfileInputDTO): Promise<UpdateUserProfileOutputDTO> {

        const existing =
            await this._profileRepository.findByUserId(userId);

        if (!existing) {
            throw new ApiError(
                HttpStatus.NOT_FOUND,
                "Profile not found."
            );
        }

        const updates = {
            basicInformation,
            lifestyle,
            family,
            home,
            occupation,
            shopping,
            technology,
            travel,
            food,
            entertainment,
            aiPreferences,
            privacy,
        };

        const updatedProfile: Partial<UserProfile> = {
            ...existing,
        };

        // Construct payload containing ONLY the sections being explicitly updated
        const sectionUpdatesPayload: Partial<UserProfile> = {};

        (Object.keys(updates) as Array<keyof typeof updates>).forEach((key) => {
            const value = updates[key];
            if (value !== undefined) {
                const mergedSection = {
                    ...((existing as any)[key] ?? {}),
                    ...value,
                };
                (updatedProfile as any)[key] = mergedSection;
                (sectionUpdatesPayload as any)[key] = mergedSection;
            }
        });

        // Collect which section keys were explicitly sent in this update
        const updatedKeys = (Object.keys(updates) as (keyof typeof updates)[]).filter(
            (key) => updates[key] !== undefined
        );

        const {
            completionPercentage,
            rewardCoins,
            completedSections,
        } = calculateProfileCompletion(
            updatedProfile as UserProfile,
            existing.completedSections || [],
            updatedKeys
        );

        const profile =
            await this._profileRepository.updateByUserId(
                userId,
                {
                    ...sectionUpdatesPayload,

                    completionPercentage,

                    rewardCoins,

                    completedSections,

                    currentSection:
                        getNextSection(completedSections),
                } as UserProfile
            );

        if (!profile) {
            throw new ApiError(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Failed to update profile."
            );
        }

        return {
            profile,
        };
    }
}