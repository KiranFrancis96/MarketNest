import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { Product } from "@/features/product/model/productSlice";

const API_URL = "http://localhost:3000/api";
axios.defaults.withCredentials = true;

export interface WishlistItem {
  _id: string;
  userId: string;
  productId: string;
  product?: Product;
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
};


export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/wishlist`);
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || "Failed to fetch wishlist");
      }
      return rejectWithValue("Failed to fetch wishlist");
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/wishlist`, { productId });
      return response.data.wishlist;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || "Failed to add to wishlist");
      }
      return rejectWithValue("Failed to add to wishlist");
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (productId: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/wishlist/${productId}`);
      return productId;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue(err.response?.data?.message || "Failed to remove from wishlist");
      }
      return rejectWithValue("Failed to remove from wishlist");
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlistState(state) {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action: PayloadAction<WishlistItem[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add to Wishlist
      .addCase(addToWishlist.fulfilled, (state, action: PayloadAction<WishlistItem>) => {
        const exists = state.items.some((item) => item.productId === action.payload.productId);
        if (!exists) {
          state.items.push(action.payload);
        }
      })
      // Remove from Wishlist
      .addCase(removeFromWishlist.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((item) => item.productId !== action.payload);
      });
  },
});

export const { clearWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;
