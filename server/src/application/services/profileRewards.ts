import type {
  UserProfile,
  ProfileSection,
} from "@/domain/entities/userProfile.entity.ts";

export const PROFILE_REWARDS = {
  basicInformation: { coins: 100, progress: 10 },
  lifestyle: { coins: 150, progress: 20 },
  family: { coins: 150, progress: 30 },
  home: { coins: 200, progress: 40 },
  occupation: { coins: 120, progress: 50 },
  shopping: { coins: 180, progress: 60 },
  technology: { coins: 140, progress: 70 },
  travel: { coins: 160, progress: 80 },
  food: { coins: 100, progress: 85 },
  entertainment: { coins: 120, progress: 90 },
  aiPreferences: { coins: 250, progress: 95 },
  privacy: { coins: 100, progress: 100 },
} as const;

function hasActualData(section: ProfileSection, value: any): boolean {
  if (!value) return false;
  if (section === "basicInformation") {
    return !!(value.gender || value.dateOfBirth || value.occupation || value.occupationType || value.maritalStatus || value.education || (value.languages && value.languages.length > 0));
  }
  if (section === "lifestyle") {
    return !!(value.exerciseFrequency || value.dietType || value.wakeUpTime || value.sleepTime || value.smoking !== undefined || value.alcohol !== undefined || value.shoppingFrequency || value.workStyle);
  }
  if (section === "family") {
    return !!(value.livingAlone !== undefined || value.familyMembers !== undefined || value.children !== undefined || value.dependents !== undefined || (Array.isArray(value.pets) && value.pets.length > 0));
  }
  if (section === "home") {
    return !!(value.houseType || value.ownership || value.bedrooms !== undefined || (Array.isArray(value.vehicles) && value.vehicles.length > 0) || (Array.isArray(value.smartHomeDevices) && value.smartHomeDevices.length > 0));
  }
  if (section === "occupation") {
    return !!(value.companyIndustry || value.jobRole || value.yearsExperience !== undefined || value.workLocation || (Array.isArray(value.skills) && value.skills.length > 0));
  }
  if (section === "shopping") {
    return !!(value.shoppingBudget || value.couponUsage !== undefined || value.cashbackInterest !== undefined || value.preferredShoppingTime || (Array.isArray(value.favoriteBrands) && value.favoriteBrands.length > 0) || (Array.isArray(value.favoriteCategories) && value.favoriteCategories.length > 0));
  }
  if (section === "technology") {
    return !!(value.primaryDevice || value.operatingSystem || value.techSavviness || (Array.isArray(value.favoriteGadgets) && value.favoriteGadgets.length > 0));
  }
  if (section === "travel") {
    return !!(value.travelFrequency || value.preferredDestination || value.accommodationStyle || value.passportStatus !== undefined);
  }
  if (section === "food") {
    return !!(value.cookingFrequency || value.diningOutFrequency || (Array.isArray(value.dietaryPreferences) && value.dietaryPreferences.length > 0) || (Array.isArray(value.favoriteCuisines) && value.favoriteCuisines.length > 0));
  }
  if (section === "entertainment") {
    return !!(value.weeklyScreenTime || (Array.isArray(value.favoriteGenres) && value.favoriteGenres.length > 0) || (Array.isArray(value.streamingServices) && value.streamingServices.length > 0) || (Array.isArray(value.hobbies) && value.hobbies.length > 0));
  }
  if (section === "aiPreferences") {
    return !!(value.aiFeatureUsage || value.preferredAiStyle || value.dataSharingConsent !== undefined || value.automatedRecommendations !== undefined);
  }
  return false;
}

export function calculateProfileCompletion(
  profile: Partial<UserProfile>,
  existingCompletedSections: ProfileSection[] = [],
  updatedKeys: (keyof Partial<UserProfile>)[] = []
): {
  completionPercentage: number;
  completedSections: ProfileSection[];
  rewardCoins: number;
} {
  const completedSections: ProfileSection[] = [];
  let rewardCoins = 0;
  let completionPercentage = 0;

  (Object.keys(PROFILE_REWARDS) as ProfileSection[]).forEach((section) => {
    // Privacy cannot be inferred from data (defaults look identical to user-submitted).
    // It is only complete if the user explicitly submitted it now, or had already completed it.
    const isCompleted =
      section === "privacy"
        ? existingCompletedSections.includes(section) ||
          updatedKeys.includes(section)
        : existingCompletedSections.includes(section) ||
          hasActualData(section, profile[section]);

    if (isCompleted) {
      completedSections.push(section);
      rewardCoins += PROFILE_REWARDS[section].coins;
      completionPercentage = PROFILE_REWARDS[section].progress;
    }
  });

  return {
    completionPercentage,
    completedSections,
    rewardCoins,
  };
}

export function getNextSection(
  completedSections: ProfileSection[]
): ProfileSection {
  const sectionOrder: ProfileSection[] = [
    "basicInformation",
    "lifestyle",
    "family",
    "home",
    "occupation",
    "shopping",
    "technology",
    "travel",
    "food",
    "entertainment",
    "aiPreferences",
    "privacy",
  ];

  return (
    sectionOrder.find(
      (section) => !completedSections.includes(section)
    ) ?? "privacy"
  );
}