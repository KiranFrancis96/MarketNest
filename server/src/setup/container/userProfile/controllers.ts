import { UserProfileController } from "@/presentation/http/controllers/userProfile.controller.ts";

import * as useCases from "./useCases.ts";

export const userProfileController =
    new UserProfileController(

        useCases.createUserProfileUseCase,

        useCases.getUserProfileUseCase,

        useCases.updateUserProfileUseCase

    );