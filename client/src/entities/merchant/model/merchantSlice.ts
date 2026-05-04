import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Merchant, MerchantAuthState } from "./types";

const savedMerchant = localStorage.getItem("merchant");
const initialState: MerchantAuthState = {
  merchant: savedMerchant ? JSON.parse(savedMerchant) : null,
  isAuthenticated: !!savedMerchant,
  isLoading: false,
};

const merchantSlice = createSlice({
  name: "merchant",
  initialState,
  reducers: {
    setMerchant: (state, action: PayloadAction<Merchant>) => {
      state.merchant = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      localStorage.setItem("merchant", JSON.stringify(action.payload));
    },
    logoutMerchant: (state) => {
      state.merchant = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      localStorage.removeItem("merchant");
    },
    setMerchantLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setMerchant, logoutMerchant, setMerchantLoading } = merchantSlice.actions;
export default merchantSlice.reducer;
