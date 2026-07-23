import { useState } from "react";
import { useDispatch } from "react-redux";
import { userProfileApi } from "@/entities/userProfile/api/userProfileApi";
import { setProfile } from "@/entities/userProfile/model/userProfileSlice";
import type { UserProfile } from "@/entities/userProfile/model/types";
import { useAlertModal } from "@/shared/ui/AlertModalContext";
import type { AppDispatch } from "@/app/store";

export const useUpdateUserProfile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { showAlert } = useAlertModal();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutateAsync = async (data: Partial<UserProfile>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userProfileApi.updateUserProfile(data);
      if (response.data.success) {
        dispatch(setProfile(response.data.profile));
      }
      return response.data;
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message || err.message || "Failed to update profile settings.";
      setError(errMsg);
      showAlert(errMsg, "error");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutateAsync,
    mutate: mutateAsync,
    isLoading,
    error,
  };
};
