import { configureStore } from "@reduxjs/toolkit";
import userReducer from "@/entities/user/model/userSlice";
import merchantReducer from "@/entities/merchant/model/merchantSlice";
import adminReducer from "@/entities/admin/model/adminSlice";
import productReducer from "@/features/product/model/productSlice";
import cartReducer from "@/features/cart/model/cartSlice";
import wishlistReducer from "@/features/wishlist/model/wishlistSlice";
import notificationReducer from "@/features/notification/model/notificationSlice";
import userProfileReducer from "@/entities/userProfile/model/userProfileSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    merchant: merchantReducer,
    admin: adminReducer,
    product: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    notification: notificationReducer,
    userProfile: userProfileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;