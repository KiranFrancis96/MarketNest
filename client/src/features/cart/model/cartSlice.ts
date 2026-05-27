import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { Product } from "@/features/product/model/productSlice";

const API_URL = "http://localhost:3000/api";
axios.defaults.withCredentials = true;

export interface CartItem {
  productId: string;
  quantity: number;
  priceSnapshot: number;
  product?: Product;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  createdAt?: string;
  updatedAt?: string;
}

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/cart`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch cart");
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/cart`, { productId, quantity });
      return response.data.cart;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to add to cart");
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/cart`, { productId, quantity });
      return response.data.cart;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update quantity");
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/cart/${productId}`);
      return response.data.cart;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to remove item");
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/cart`);
      return response.data.cart;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to clear cart");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartState(state) {
      state.cart = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add To Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Quantity
      .addCase(updateCartQuantity.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.cart = action.payload;
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Remove From Cart
      .addCase(removeFromCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.cart = action.payload;
      })
      // Clear Cart
      .addCase(clearCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.cart = action.payload;
      });
  },
});

export const { clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
