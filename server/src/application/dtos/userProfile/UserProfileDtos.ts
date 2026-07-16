import type {
    BasicInformation,
    UserProfile,
} from "@/domain/entities/userProfile.entity.ts";

export interface CreateUserProfileInputDTO {
    userId: string;
    basicInformation: BasicInformation;
}

export interface CreateUserProfileOutputDTO {
    profile: UserProfile;
}

export interface GetUserProfileInputDTO {
    userId: string;
}

export interface UpdateLifestyleInputDTO {
    userId: string;
    lifestyle: UserProfile["lifestyle"];
}

export interface UpdateFamilyInputDTO {
    userId: string;
    family: UserProfile["family"];
}

export interface UpdateHomeInputDTO {
    userId: string;
    home: UserProfile["home"];
}

export interface UpdateShoppingInputDTO {
    userId: string;
    shopping: UserProfile["shopping"];
}

export interface UpdatePrivacyInputDTO {
    userId: string;
    privacy: UserProfile["privacy"];
}