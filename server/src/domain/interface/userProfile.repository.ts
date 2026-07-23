import type { IBaseRepository } from "./IBaseRepository.ts";
import type { UserProfile } from "../entities/userProfile.entity.ts";

export interface IUserProfileRepository
    extends IBaseRepository<UserProfile> {

    findByUserId(userId: string): Promise<UserProfile | null>;

    updateByUserId(
        userId: string,
        data: Partial<UserProfile>
    ): Promise<UserProfile | null>;
}   