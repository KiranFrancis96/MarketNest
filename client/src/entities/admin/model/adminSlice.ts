import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Admin, User, Merchant } from "./types";

interface AdminState {
  admin: Admin | null;
  users: User[];
  merchants: Merchant[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  admin: localStorage.getItem("admin") ? JSON.parse(localStorage.getItem("admin")!) : null,
  users: [],
  merchants: [],
  isLoading: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdmin: (state, action: PayloadAction<Admin | null>) => {
      state.admin = action.payload;
      if (action.payload) {
        localStorage.setItem("admin", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("admin");
      }
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    setMerchants: (state, action: PayloadAction<Merchant[]>) => {
      state.merchants = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateMerchantStatus: (state, action: PayloadAction<{ id: string; status: Merchant["status"]; isAdminVerified: boolean }>) => {
      const merchant = state.merchants.find((m) => m._id === action.payload.id);
      if (merchant) {
        merchant.status = action.payload.status;
        merchant.isAdminVerified = action.payload.isAdminVerified;
      }
    },
    updateUserBlockStatus: (state, action: PayloadAction<{ id: string; isBlocked: boolean }>) => {
      const user = state.users.find((u) => u._id === action.payload.id);
      if (user) {
        user.isBlocked = action.payload.isBlocked;
      }
    },
    updateMerchantBlockStatus: (state, action: PayloadAction<{ id: string; isBlocked: boolean }>) => {
      const merchant = state.merchants.find((m) => m._id === action.payload.id);
      if (merchant) {
        merchant.isBlocked = action.payload.isBlocked;
      }
    },
  },
});

export const { 
  setAdmin, 
  setUsers, 
  setMerchants, 
  setLoading, 
  setError, 
  updateMerchantStatus,
  updateUserBlockStatus,
  updateMerchantBlockStatus 
} = adminSlice.actions;
export default adminSlice.reducer;
