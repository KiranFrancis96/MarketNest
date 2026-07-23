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

    occupation?: UserProfile["occupation"];

    shopping?: UserProfile["shopping"];

    technology?: UserProfile["technology"];

    travel?: UserProfile["travel"];

    food?: UserProfile["food"];

    entertainment?: UserProfile["entertainment"];

    aiPreferences?: UserProfile["aiPreferences"];

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
        const basicInfo = d.basicInformation ? {
            ...d.basicInformation,
            occupation: d.basicInformation.occupation || d.basicInformation.occupationType,
            occupationType: d.basicInformation.occupationType || d.basicInformation.occupation,
        } : {};

        return {
            _id: d._id?.toString() || d.id,

            userId: d.userId?.toString() || "",

            basicInformation: basicInfo,

            lifestyle: d.lifestyle ?? {},

            family: d.family ?? {},

            home: d.home ?? {},

            occupation: d.occupation ?? {},

            shopping: d.shopping ?? {},

            technology: d.technology ?? {},

            travel: d.travel ?? {},

            food: d.food ?? {},

            entertainment: d.entertainment ?? {},

            aiPreferences: d.aiPreferences ?? {},

            privacy: d.privacy ?? {},

            completionPercentage: d.completionPercentage ?? 0,

            rewardCoins: d.rewardCoins ?? 0,

            completedSections: d.completedSections ?? [],

            currentSection: d.currentSection,

            createdAt: d.createdAt,

            updatedAt: d.updatedAt,
        };
    }

    static toDocument(entity: Partial<UserProfile>): Record<string, unknown> {
        const basicInfo = entity.basicInformation ? {
            ...entity.basicInformation,
            occupation: entity.basicInformation.occupation || entity.basicInformation.occupationType,
            occupationType: entity.basicInformation.occupationType || entity.basicInformation.occupation,
        } : undefined;

        return {
            userId: entity.userId,

            basicInformation: basicInfo,

            lifestyle: entity.lifestyle,

            family: entity.family,

            home: entity.home,

            occupation: entity.occupation,

            shopping: entity.shopping,

            technology: entity.technology,

            travel: entity.travel,

            food: entity.food,

            entertainment: entity.entertainment,

            aiPreferences: entity.aiPreferences,

            privacy: entity.privacy,

            completionPercentage: entity.completionPercentage,

            rewardCoins: entity.rewardCoins,

            completedSections: entity.completedSections,

            currentSection: entity.currentSection,
        };
    }
}