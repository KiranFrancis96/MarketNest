import type {
    BasicInformation,
    UserProfile,
} from "@/domain/entities/userProfile.entity.ts";

/* -------------------- CREATE -------------------- */

export interface CreateUserProfileInputDTO {
    userId: string;
    basicInformation: BasicInformation;
}

export interface CreateUserProfileOutputDTO {
    profile: UserProfile;
}

/* -------------------- GET -------------------- */

export interface GetUserProfileInputDTO {
    userId: string;
}

/* -------------------- UPDATE -------------------- */

export interface UpdateUserProfileInputDTO {
    userId: string;

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
}

export interface UpdateUserProfileOutputDTO {
    profile: UserProfile;
}