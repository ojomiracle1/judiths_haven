import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

const initialState = {
  products: [],
  product: null,
  isLoading: false,
  isError: false,
  message: '',
  page: 1,
  pages: 1,
};

// Helper to get token from state/localStorage
const getToken = (thunkAPI) => {
  const state = thunkAPI.getState();
  return state.auth?.user?.token || JSON.parse(localStorage.getItem('user'))?.token;
};

// Get all products
export const getProducts = createAsyncThunk(
  'product/getProducts',
  async ({ page = 1, limit = 10 } = {}, thunkAPI) => {
    try {
      const response = await api.get(`/api/products?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get products by category
export const getProductsByCategory = createAsyncThunk(
  'product/getProductsByCategory',
  async (categoryId, thunkAPI) => {
    try {
      const response = await api.get(`/api/products/category/${categoryId}`);
      return response.data.products || [];
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single product
export const getProductById = createAsyncThunk(
  'product/getProductById',
  async (id, thunkAPI) => {
    try {
      // Validate MongoDB ObjectId
      if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        return thunkAPI.rejectWithValue('Invalid product ID');
      }

      const response = await api.get(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create product
export const createProduct = createAsyncThunk(
  'product/create',
  async (productData, thunkAPI) => {
    try {
      const token = getToken(thunkAPI);
  const response = await api.post('/products', productData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update product
export const updateProduct = createAsyncThunk(
  'product/update',
  async ({ id, ...productData }, thunkAPI) => {
    try {
      const token = getToken(thunkAPI);
      const response = await api.put(`/api/products/${id}`, productData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete product
export const deleteProduct = createAsyncThunk(
  'product/delete',
  async (id, thunkAPI) => {
    try {
      const token = getToken(thunkAPI);
      await api.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id;
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Advanced search and filter
export const searchProducts = createAsyncThunk(
  'product/searchProducts',
  async (params, thunkAPI) => {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await api.get(`/api/products?${query}`);
      return response.data.products || [];
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Fetch related products for recommendations
export const fetchRelatedProducts = createAsyncThunk(
  'product/fetchRelatedProducts',
  async (productId, thunkAPI) => {
    try {
      const response = await api.get(`/api/products/${productId}/related`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all products
      .addCase(getProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products || [];
        state.page = action.payload.page || 1;
        state.pages = action.payload.pages || 1;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get products by category
      .addCase(getProductsByCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProductsByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(getProductsByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get single product
      .addCase(getProductById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.product = action.payload;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = state.products.map((product) =>
          product._id === action.payload._id ? action.payload : product
        );
        state.product = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = state.products.filter(
          (product) => product._id !== action.payload
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Search and filter products
      .addCase(searchProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Fetch related products
      .addCase(fetchRelatedProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchRelatedProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = productSlice.actions;
export default productSlice.reducer;