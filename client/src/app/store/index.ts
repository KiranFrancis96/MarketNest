import { configureStore } from "@reduxjs/toolkit";
import userReducer from "@/entities/user/model/userSlice";
import merchantReducer from "@/entities/merchant/model/merchantSlice";
import adminReducer from "@/entities/admin/model/adminSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    merchant: merchantReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;