import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// Set base URL for API requests
const API_URL = "http://localhost:3000/api";
axios.defaults.withCredentials = true;

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  tags: string[];
  price: number;
  offerPrice?: number;
  stock: number;
  images: string[];
  merchantId: string;
  isBlocked: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  subcategories: string[];
}

export interface ShoppingFeed {
  recommendedForYou: Product[];
  dealsYouMayLike: Product[];
  trendingProducts: Product[];
  basedOnShoppingStyle: Product[];
}

export interface CatalogFeed {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

interface ProductState {
  products: Product[];
  merchantProducts: Product[];
  categories: Category[];
  shoppingFeed: ShoppingFeed | null;
  catalogFeed: CatalogFeed | null;
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  merchantProducts: [],
  categories: [],
  shoppingFeed: null,
  catalogFeed: null,
  currentProduct: null,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchCategories = createAsyncThunk(
  "product/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch categories");
    }
  }
);

export const createCategory = createAsyncThunk(
  "product/createCategory",
  async (data: { name: string; subcategories: string[] }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/categories`, data);
      return response.data.category;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to create category");
    }
  }
);

export const addSubcategory = createAsyncThunk(
  "product/addSubcategory",
  async (data: { name: string; subcategoryName: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/categories/subcategory`, data);
      return response.data.category;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to add subcategory");
    }
  }
);

export const fetchShoppingFeed = createAsyncThunk(
  "product/fetchShoppingFeed",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products/recommendations`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch shopping recommendations");
    }
  }
);

export const fetchCatalog = createAsyncThunk(
  "product/fetchCatalog",
  async (params: Record<string, any>, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products`, { params });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch product catalog");
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "product/fetchProductById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products/${id}`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Product not found");
    }
  }
);

export const fetchMerchantProducts = createAsyncThunk(
  "product/fetchMerchantProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products/merchant/list`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch merchant products");
    }
  }
);

export const addProduct = createAsyncThunk(
  "product/addProduct",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/products/merchant/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.product;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to add product");
    }
  }
);

export const editProduct = createAsyncThunk(
  "product/editProduct",
  async ({ id, formData }: { id: string; formData: FormData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/products/merchant/edit/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.product;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update product");
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/products/merchant/delete/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete product");
    }
  }
);

export const toggleBlockProduct = createAsyncThunk(
  "product/toggleBlockProduct",
  async ({ id, isBlocked }: { id: string; isBlocked: boolean }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/products/admin/block/${id}`, { isBlocked });
      return response.data.product;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to toggle block status");
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearCurrentProduct(state) {
      state.currentProduct = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Category
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.categories.push(action.payload);
      })
      // Add Subcategory
      .addCase(addSubcategory.fulfilled, (state, action: PayloadAction<Category>) => {
        const index = state.categories.findIndex((c) => c._id === action.payload._id);
        if (index > -1) {
          state.categories[index] = action.payload;
        }
      })
      // Fetch Shopping Feed
      .addCase(fetchShoppingFeed.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchShoppingFeed.fulfilled, (state, action: PayloadAction<ShoppingFeed>) => {
        state.loading = false;
        state.shoppingFeed = action.payload;
      })
      .addCase(fetchShoppingFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Catalog
      .addCase(fetchCatalog.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCatalog.fulfilled, (state, action: PayloadAction<CatalogFeed>) => {
        state.loading = false;
        state.catalogFeed = action.payload;
      })
      .addCase(fetchCatalog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Product by ID
      .addCase(fetchProductById.fulfilled, (state, action: PayloadAction<Product>) => {
        state.currentProduct = action.payload;
      })
      // Fetch Merchant Products
      .addCase(fetchMerchantProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMerchantProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.loading = false;
        state.merchantProducts = action.payload;
      })
      .addCase(fetchMerchantProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add Product
      .addCase(addProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.merchantProducts.push(action.payload);
      })
      // Edit Product
      .addCase(editProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        const index = state.merchantProducts.findIndex((p) => p._id === action.payload._id);
        if (index > -1) {
          state.merchantProducts[index] = action.payload;
        }
      })
      // Delete Product
      .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<string>) => {
        state.merchantProducts = state.merchantProducts.filter((p) => p._id !== action.payload);
      })
      // Toggle Block Product
      .addCase(toggleBlockProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        const mIndex = state.merchantProducts.findIndex((p) => p._id === action.payload._id);
        if (mIndex > -1) {
          state.merchantProducts[mIndex] = action.payload;
        }
        if (state.catalogFeed) {
          const cIndex = state.catalogFeed.products.findIndex((p) => p._id === action.payload._id);
          if (cIndex > -1) {
            state.catalogFeed.products[cIndex] = action.payload;
          }
        }
      });
  },
});

export const { clearCurrentProduct, clearError } = productSlice.actions;
export default productSlice.reducer;
