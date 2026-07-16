import type { UserProfile } from "@/domain/entities/userProfile.entity.ts";

import type {
    CreateUserProfileInputDTO,
    CreateUserProfileOutputDTO,
    GetUserProfileInputDTO,
    UpdateLifestyleInputDTO,
    UpdateFamilyInputDTO,
    UpdateHomeInputDTO,
    UpdateShoppingInputDTO,
    UpdatePrivacyInputDTO,
} from "@/application/dtos/userProfile/UserProfileDtos.ts";

export interface ICreateUserProfileUseCase {
    execute(
        input: CreateUserProfileInputDTO
    ): Promise<CreateUserProfileOutputDTO>;
}

export interface IGetUserProfileUseCase {
    execute(
        input: GetUserProfileInputDTO
    ): Promise<UserProfile>;
}

export interface IUpdateLifestyleUseCase {
    execute(input: UpdateLifestyleInputDTO): Promise<UserProfile>;
}

export interface IUpdateFamilyUseCase {
    execute(input: UpdateFamilyInputDTO): Promise<UserProfile>;
}

export interface IUpdateHomeUseCase {
    execute(input: UpdateHomeInputDTO): Promise<UserProfile>;
}

export interface IUpdateShoppingUseCase {
    execute(input: UpdateShoppingInputDTO): Promise<UserProfile>;
}

export interface IUpdatePrivacyUseCase {
    execute(input: UpdatePrivacyInputDTO): Promise<UserProfile>;
}