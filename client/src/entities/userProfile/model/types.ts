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
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  occupationType?: string;
  education?: string;
  languages?: string[];
}

export interface Occupation {
  companyIndustry?: string;
  jobRole?: string;
  yearsExperience?: number;
  workLocation?: string;
  skills?: string[];
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

export interface UserProfile {
  _id?: string;
  userId: string;
  basicInformation?: BasicInformation;
  lifestyle?: Record<string, any>;
  family?: Record<string, any>;
  home?: Record<string, any>;
  occupation?: Occupation;
  shopping?: Record<string, any>;
  technology?: Technology;
  travel?: Travel;
  food?: Food;
  entertainment?: Entertainment;
  aiPreferences?: AiPreferences;
  privacy?: Record<string, any>;
  completionPercentage?: number;
  rewardCoins?: number;
  completedSections?: ProfileSection[];
  currentSection?: ProfileSection;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}
