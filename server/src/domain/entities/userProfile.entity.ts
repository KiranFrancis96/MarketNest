export type ProfileSection =
    | "basicInformation"
    | "lifestyle"
    | "family"
    | "home"
    | "shopping"
    | "privacy";

export interface BasicInformation {
    dateOfBirth?: Date;
    gender?: string;
    maritalStatus?: string;
    occupationType?: string;
    education?: string;
    languages?: string[];
}

export interface Lifestyle {
    exerciseFrequency?: string;
    wakeUpTime?: string;
    sleepTime?: string;
    dietType?: string;
    smoking?: boolean;
    alcohol?: boolean;
    shoppingFrequency?: string;
    workStyle?: string;
}

export interface FamilyInformation {
    livingAlone?: boolean;
    familyMembers?: number;
    children?: number;
    dependents?: number;
    pets?: string[];
}

export interface HomeInformation {
    houseType?: string;
    ownership?: string;
    bedrooms?: number;
    vehicles?: string[];
    smartHomeDevices?: string[];
}

export interface ShoppingPreferences {
    favoriteBrands?: string[];
    favoriteCategories?: string[];
    shoppingBudget?: string;
    couponUsage?: boolean;
    cashbackInterest?: boolean;
    preferredShoppingTime?: string;
}

export interface PrivacySettings {
    allowPersonalization?: boolean;
    allowAnalytics?: boolean;
    allowMarketing?: boolean;
    allowAiLearning?: boolean;
}

export interface UserProfile {
    _id?: string;

    userId: string;

    basicInformation?: BasicInformation;

    lifestyle?: Lifestyle;

    family?: FamilyInformation;

    home?: HomeInformation;

    shopping?: ShoppingPreferences;

    privacy?: PrivacySettings;

    completionPercentage?: number;

    rewardCoins?: number;

    completedSections?: ProfileSection[];

    currentSection?: ProfileSection;

    createdAt?: Date;

    updatedAt?: Date;
}