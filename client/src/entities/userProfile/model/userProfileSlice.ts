import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserProfile, UserProfileState } from "./types";

const initialState: UserProfileState = {
  profile: null,
  loading: false,
  error: null,
};

const userProfileSlice = createSlice({
  name: "userProfile",
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<UserProfile | null>) {
      state.profile = action.payload;
      state.loading = false;
      state.error = null;
    },
    clearProfile(state) {
      state.profile = null;
      state.loading = false;
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setProfile, clearProfile, setLoading, setError } = userProfileSlice.actions;
export default userProfileSlice.reducer;
