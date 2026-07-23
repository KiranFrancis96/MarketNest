export type ProfileSection =
    | "basicInformation"
    | "lifestyle"
    | "family"
    | "home"
    | "occupation"
    | "shopping"
    | "technology"
    | "travel"
    | "food"
    | "entertainment"
    | "aiPreferences"
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

export interface Occupation {
    companyIndustry?: string;
    jobRole?: string;
    yearsExperience?: number;
    workLocation?: string;
    skills?: string[];
}

export interface ShoppingPreferences {
    favoriteBrands?: string[];
    favoriteCategories?: string[];
    shoppingBudget?: string;
    couponUsage?: boolean;
    cashbackInterest?: boolean;
    preferredShoppingTime?: string;
}

export interface Technology {
    primaryDevice?: string;
    operatingSystem?: string;
    techSavviness?: string;
    favoriteGadgets?: string[];
}

export interface Travel {
    travelFrequency?: string;
    preferredDestination?: string;
    accommodationStyle?: string;
    passportStatus?: boolean;
}

export interface Food {
    dietaryPreferences?: string[];
    favoriteCuisines?: string[];
    cookingFrequency?: string;
    diningOutFrequency?: string;
}

export interface Entertainment {
    favoriteGenres?: string[];
    streamingServices?: string[];
    hobbies?: string[];
    weeklyScreenTime?: string;
}

export interface AiPreferences {
    aiFeatureUsage?: string;
    preferredAiStyle?: string;
    dataSharingConsent?: boolean;
    automatedRecommendations?: boolean;
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

    occupation?: Occupation;

    shopping?: ShoppingPreferences;

    technology?: Technology;

    travel?: Travel;

    food?: Food;

    entertainment?: Entertainment;

    aiPreferences?: AiPreferences;

    privacy?: PrivacySettings;

    completionPercentage?: number;

    rewardCoins?: number;

    completedSections?: ProfileSection[];

    currentSection?: ProfileSection;

    createdAt?: Date;

    updatedAt?: Date;
}