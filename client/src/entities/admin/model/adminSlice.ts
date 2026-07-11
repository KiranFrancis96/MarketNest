import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Admin, User, Merchant } from "./types";

interface AdminState {
  admin: Admin | null;
  users: User[];
  merchants: Merchant[];
  isLoading: boolean;
  error: string | null;
  step: "login" | "forgot" | "reset";
}

const initialState: AdminState = {
  admin: localStorage.getItem("admin") ? JSON.parse(localStorage.getItem("admin")!) : null,
  users: [],
  merchants: [],
  isLoading: false,
  error: null,
  step: "login",
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
    setAdminAuthStep: (state, action: PayloadAction<"login" | "forgot" | "reset">) => {
      state.step = action.payload;
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
    updateUserAction: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex((u) => u._id === action.payload._id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    deleteUserAction: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((u) => u._id !== action.payload);
    },
    addUserAction: (state, action: PayloadAction<User>) => {
      state.users.unshift(action.payload);
    },
    updateMerchantAction: (state, action: PayloadAction<Merchant>) => {
      const index = state.merchants.findIndex((m) => m._id === action.payload._id);
      if (index !== -1) {
        state.merchants[index] = action.payload;
      }
    },
    deleteMerchantAction: (state, action: PayloadAction<string>) => {
      state.merchants = state.merchants.filter((m) => m._id !== action.payload);
    },
    addMerchantAction: (state, action: PayloadAction<Merchant>) => {
      state.merchants.unshift(action.payload);
    },
  },
});

export const { 
  setAdmin, 
  setAdminAuthStep,
  setUsers, 
  setMerchants, 
  setLoading, 
  setError, 
  updateMerchantStatus,
  updateUserBlockStatus,
  updateMerchantBlockStatus,
  updateUserAction,
  deleteUserAction,
  addUserAction,
  updateMerchantAction,
  deleteMerchantAction,
  addMerchantAction
} = adminSlice.actions;
export default adminSlice.reducer;
