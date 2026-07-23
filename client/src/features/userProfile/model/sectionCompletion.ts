import type { ProfileSection } from "@/entities/userProfile/model/types";

/**
 * Field specifications for each profile section.
 * Defines the expected form fields used to calculate exact section completion percentage.
 */
export const SECTION_FIELD_KEYS: Record<string, string[]> = {
  basicInformation: [
    "dateOfBirth",
    "gender",
    "maritalStatus",
    "occupationType",
    "education",
    "languages",
  ],
  lifestyle: [
    "exerciseFrequency",
    "wakeUpTime",
    "sleepTime",
    "dietType",
    "smoking",
    "alcohol",
    "shoppingFrequency",
    "workStyle",
  ],
  family: [
    "livingAlone",
    "familyMembers",
    "children",
    "dependents",
    "pets",
  ],
  home: [
    "houseType",
    "ownership",
    "bedrooms",
    "vehicles",
    "smartHomeDevices",
  ],
  occupation: [
    "companyIndustry",
    "jobRole",
    "yearsExperience",
    "workLocation",
    "skills",
  ],
  shopping: [
    "favoriteBrands",
    "favoriteCategories",
    "shoppingBudget",
    "couponUsage",
    "cashbackInterest",
    "preferredShoppingTime",
  ],
  technology: [
    "primaryDevice",
    "operatingSystem",
    "techSavviness",
    "favoriteGadgets",
  ],
  travel: [
    "travelFrequency",
    "preferredDestination",
    "accommodationStyle",
    "passportStatus",
  ],
  food: [
    "dietaryPreferences",
    "favoriteCuisines",
    "cookingFrequency",
    "diningOutFrequency",
  ],
  entertainment: [
    "favoriteGenres",
    "streamingServices",
    "hobbies",
    "weeklyScreenTime",
  ],
  aiPreferences: [
    "aiFeatureUsage",
    "preferredAiStyle",
    "dataSharingConsent",
    "automatedRecommendations",
  ],
  privacy: [
    "allowPersonalization",
    "allowAnalytics",
    "allowMarketing",
    "allowAiLearning",
  ],
};

/**
 * Evaluates whether a field value is considered completed based on rules:
 * - string: not empty (trimmed length > 0)
 * - array: at least one item (length > 0)
 * - boolean: has a boolean value (true or false)
 * - number: valid number (not null or undefined and not NaN)
 * - ignores: undefined, null, empty string, empty array
 */
export function isFieldValueFilled(val: any): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === "string") return val.trim().length > 0;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === "boolean") return true;
  if (typeof val === "number") return !isNaN(val);
  return false;
}

/**
 * Calculates completion percentage for any section independently:
 * (Number of completed fields in section) / (Total fields in section) * 100
 */
export function calculateSectionCompletion(
  sectionIdOrData?: string | Record<string, any> | null,
  sectionDataParam?: Record<string, any> | null
): number {
  let sectionId: string | null = null;
  let sectionData: Record<string, any> | null = null;

  if (typeof sectionIdOrData === "string") {
    sectionId = sectionIdOrData;
    sectionData = sectionDataParam || null;
  } else if (sectionIdOrData && typeof sectionIdOrData === "object") {
    sectionData = sectionIdOrData;
  }

  if (!sectionData) return 0;

  let expectedFields = sectionId ? SECTION_FIELD_KEYS[sectionId] : undefined;

  if (!expectedFields || expectedFields.length === 0) {
    expectedFields = Object.keys(sectionData);
  }

  if (!expectedFields || expectedFields.length === 0) return 0;

  let filledCount = 0;
  for (const field of expectedFields) {
    let val = sectionData[field];
    // Alias fallback check (e.g. occupationType vs occupation)
    if (field === "occupationType" && val === undefined && sectionData["occupation"] !== undefined) {
      val = sectionData["occupation"];
    }
    if (isFieldValueFilled(val)) {
      filledCount++;
    }
  }

  return Math.round((filledCount / expectedFields.length) * 100);
}
