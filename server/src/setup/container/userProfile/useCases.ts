import { userProfileRepository } from "./repositories.ts";

import { CreateUserProfileUseCase } from "@/application/useCases/userProfile/createUserProfile.usecase.ts";
import { GetUserProfileUseCase } from "@/application/useCases/userProfile/getUserProfile.usecase.ts";
import { UpdateUserProfileUseCase } from "@/application/useCases/userProfile/updateUserProfile.usecase.ts";

export const createUserProfileUseCase =
    new CreateUserProfileUseCase(userProfileRepository);

export const getUserProfileUseCase =
    new GetUserProfileUseCase(userProfileRepository);

export const updateUserProfileUseCase =
    new UpdateUserProfileUseCase(userProfileRepository);