import { baseApi } from "@/shared/api/baseApi";
import type { UserProfile } from "../model/types";
import { PROFILE } from "@/shared/api/apiRoutes";

export const userProfileApi = {
  createUserProfile: (data: { basicInformation: any }) =>
    baseApi.post<{ success: boolean; message: string; profile: UserProfile }>(PROFILE, data),

  getUserPersonalizationProfile: () =>
    baseApi.get<{ success: boolean; profile: UserProfile }>(PROFILE),

  /**
   * Updates any personalization section payload (basicInformation, lifestyle, family, home,
   * shopping, privacy, occupation, technology, travel, food, entertainment, aiPreferences).
   */
  updateUserProfile: (data: Partial<UserProfile>) =>
    baseApi.put<{ success: boolean; message: string; profile: UserProfile }>(PROFILE, data),

  // TODO: Once backend endpoints support dedicated section routes or extended schemas,
  // contract calls can be routed here seamlessly without breaking existing frontend code.
};
