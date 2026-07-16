import type {
  UserProfile,
  ProfileSection,
} from "@/domain/entities/userProfile.entity.ts";

export const PROFILE_REWARDS = {
  basicInformation: { coins: 100, progress: 15 },
  lifestyle: { coins: 150, progress: 30 },
  family: { coins: 150, progress: 45 },
  home: { coins: 200, progress: 60 },
  shopping: { coins: 250, progress: 85 },
  privacy: { coins: 100, progress: 100 },
} as const;

export function calculateProfileCompletion(profile: UserProfile): {
  completionPercentage: number;
  completedSections: ProfileSection[];
  rewardCoins: number;
} {
  const completedSections: ProfileSection[] = [];
  let rewardCoins = 0;
  let completionPercentage = 0;

  (Object.keys(PROFILE_REWARDS) as ProfileSection[]).forEach((section) => {
    const value = profile[section];

    if (
      value &&
      typeof value === "object" &&
      Object.keys(value).length > 0
    ) {
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
    "shopping",
    "privacy",
  ];

  return (
    sectionOrder.find(
      (section) => !completedSections.includes(section)
    ) ?? "privacy"
  );
}