import { BaseRepository } from "./BaseRepository.ts";

import type { IUserProfileRepository } from "@/domain/interface/userProfile.repository.ts";

import type { UserProfile } from "@/domain/entities/userProfile.entity.ts";

import { UserProfileModel } from "../models/userProfile.model.ts";

import { UserProfileMapper } from "../mappers/UserProfileMapper.ts";

export class UserProfileRepository
    extends BaseRepository<UserProfile>
    implements IUserProfileRepository {
    constructor() {
        super(UserProfileModel, UserProfileMapper);
    }

    async findByUserId(userId: string): Promise<UserProfile | null> {
        const profile = await this.model.findOne({ userId }).lean();

        return this.mapper.toEntity(profile);
    }


        async updateByUserId(
        userId: string,
        data: Partial<UserProfile>
    ): Promise<UserProfile | null> {

        return this.findOneAndUpdate(
            { userId },
            data
        );
    }
}