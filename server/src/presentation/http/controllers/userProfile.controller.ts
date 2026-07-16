import type { Request, Response } from "express";

import { HttpStatus } from "@/utils/httpStatus.ts";

import {
    CreateUserProfileRequestSchema,
} from "@/presentation/dtos/userProfile/UserProfileDtos.ts";

import type {
    ICreateUserProfileUseCase,
    IGetUserProfileUseCase,
} from "@/application/IUseCases/userProfile/IUserProfileUseCases.ts";

export class UserProfileController {
    constructor(
        private _createProfileUseCase: ICreateUserProfileUseCase,
        private _getProfileUseCase: IGetUserProfileUseCase
    ) { }

    createProfile = async (
        req: Request,
        res: Response
    ): Promise<void> => {

        // @ts-ignore
        const userId = req.user?.id;

        if (!userId) {
            res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }


        const validated = CreateUserProfileRequestSchema.parse({
            body: req.body,
        });

        const { basicInformation } = validated.body;

        const result = await this._createProfileUseCase.execute({
            userId,
            basicInformation,
        });

        res.status(HttpStatus.CREATED).json({
            success: true,
            message: "Profile created successfully.",
            profile: result.profile,
        });
    };

    getProfile = async (
        req: Request,
        res: Response
    ): Promise<void> => {

        // @ts-ignore
        const userId = req.user?.id;

        if (!userId) {
            res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }

        const profile = await this._getProfileUseCase.execute({
            userId,
        });

        res.status(HttpStatus.OK).json({
            success: true,
            profile,
        });
    };
}