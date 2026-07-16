export type ProfileSection =
  | "basicInformation"
  | "lifestyle"
  | "family"
  | "home"
  | "shopping"
  | "privacy";

export interface BasicInformation {
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  occupationType?: string;
  education?: string;
  languages?: string[];
}

export interface UserProfile {
  _id?: string;
  userId: string;
  basicInformation?: BasicInformation;
  lifestyle?: Record<string, any>;
  family?: Record<string, any>;
  home?: Record<string, any>;
  shopping?: Record<string, any>;
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
