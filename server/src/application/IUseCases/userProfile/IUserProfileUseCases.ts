import type { UserProfile } from "@/domain/entities/userProfile.entity.ts";

import type {
    CreateUserProfileInputDTO,
    CreateUserProfileOutputDTO,
    GetUserProfileInputDTO,
    UpdateUserProfileInputDTO,
    UpdateUserProfileOutputDTO,
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

export interface IUpdateUserProfileUseCase {
    execute(
        input: UpdateUserProfileInputDTO
    ): Promise<UpdateUserProfileOutputDTO>;
}