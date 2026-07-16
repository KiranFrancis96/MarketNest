import { baseApi } from "@/shared/api/baseApi";
import type { UserProfile } from "../model/types";
import { PROFILE } from "@/shared/api/apiRoutes";

export const userProfileApi = {
  createUserProfile: (data: { basicInformation: any }) =>
    baseApi.post<{ success: boolean; message: string; profile: UserProfile }>(PROFILE, data),

  getUserPersonalizationProfile: () =>
    baseApi.get<{ success: boolean; profile: UserProfile }>(PROFILE),
};
