export { PersonalizationOverviewCard } from "./ui/PersonalizationOverviewCard";
export { ProfileCompletionBar } from "./ui/ProfileCompletionBar";
export { RewardCard } from "./ui/RewardCard";
export { SectionCard } from "./ui/SectionCard";

export { BasicInformationForm } from "./ui/BasicInformationForm";
export { LifestyleForm } from "./ui/LifestyleForm";
export { FamilyForm } from "./ui/FamilyForm";
export { HomeForm } from "./ui/HomeForm";
export { ShoppingForm } from "./ui/ShoppingForm";
export { PrivacyForm } from "./ui/PrivacyForm";

export { OccupationForm } from "./ui/OccupationForm";
export { TechnologyForm } from "./ui/TechnologyForm";
export { TravelForm } from "./ui/TravelForm";
export { FoodForm } from "./ui/FoodForm";
export { EntertainmentForm } from "./ui/EntertainmentForm";
export { AiPreferencesForm } from "./ui/AiPreferencesForm";

export {
  calculateSectionCompletion,
  isFieldValueFilled,
  SECTION_FIELD_KEYS,
} from "./model/sectionCompletion";

export type {
  UserProfile,
  BasicInformation,
  Occupation,
  Technology,
  Travel,
  Food,
  Entertainment,
  AiPreferences,
  ProfileSection,
} from "@/entities/userProfile/model/types";
