import type { UserProfile } from "@/domain/entities/userProfile.entity.ts";
import mongoose from "mongoose";

interface IUserProfileDoc {
    _id?: mongoose.Types.ObjectId | string;
    id?: string;

    userId?: mongoose.Types.ObjectId | string;

    basicInformation?: UserProfile["basicInformation"];

    lifestyle?: UserProfile["lifestyle"];

    family?: UserProfile["family"];

    home?: UserProfile["home"];

    shopping?: UserProfile["shopping"];

    privacy?: UserProfile["privacy"];

    completionPercentage?: number;

    rewardCoins?: number;

    completedSections?: UserProfile["completedSections"];

    currentSection?: UserProfile["currentSection"];

    createdAt?: Date;

    updatedAt?: Date;
}

export class UserProfileMapper {
    static toEntity(doc: unknown): UserProfile | null {
        if (!doc) return null;

        const d = doc as IUserProfileDoc;

        return {
            _id: d._id?.toString() || d.id,

            userId: d.userId?.toString() || "",

            basicInformation: d.basicInformation ?? {},

            lifestyle: d.lifestyle ?? {},

            family: d.family ?? {},

            home: d.home ?? {},

            shopping: d.shopping ?? {},

            privacy: d.privacy ?? {},

            completionPercentage: d.completionPercentage ?? 0,

            rewardCoins: d.rewardCoins ?? 0,

            completedSections: d.completedSections ?? [],

            currentSection: d.currentSection,

            createdAt: d.createdAt,

            updatedAt: d.updatedAt,
        };
    }

    static toDocument(entity: UserProfile): Record<string, unknown> {
        return {
            userId: entity.userId,

            basicInformation: entity.basicInformation,

            lifestyle: entity.lifestyle,

            family: entity.family,

            home: entity.home,

            shopping: entity.shopping,

            privacy: entity.privacy,

            completionPercentage: entity.completionPercentage,

            rewardCoins: entity.rewardCoins,

            completedSections: entity.completedSections,

            currentSection: entity.currentSection,
        };
    }
}