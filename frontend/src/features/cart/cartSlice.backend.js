import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

const initialState = {
  cartItems: [],
  shippingAddress: {},
  paymentMethod: '',
  isLoading: false,
  isError: false,
  message: '',
};

// Fetch cart from backend
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get('/api/cart');
      // Map backend items to frontend format
      return (data?.items || []).map(item => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.image || (Array.isArray(item.product.images) && item.product.images.length > 0 ? item.product.images[0] : ''),
        price: item.product.price,
        countInStock: item.product.countInStock,
        qty: item.quantity,
      }));
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add to cart (backend)
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ id, qty }, thunkAPI) => {
    try {
      await api.post('/api/cart/add', { productId: id, quantity: qty });
      // Refetch cart after add
      const { data } = await api.get('/api/cart');
      return (data?.items || []).map(item => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.image || (Array.isArray(item.product.images) && item.product.images.length > 0 ? item.product.images[0] : ''),
        price: item.product.price,
        countInStock: item.product.countInStock,
        qty: item.quantity,
      }));
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update cart item quantity (backend)
export const updateCartItemQuantityAsync = createAsyncThunk(
  'cart/updateCartItemQuantityAsync',
  async ({ id, qty }, thunkAPI) => {
    try {
      await api.put('/api/cart/update', { productId: id, quantity: qty });
      const { data } = await api.get('/api/cart');
      return (data?.items || []).map(item => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.image || (Array.isArray(item.product.images) && item.product.images.length > 0 ? item.product.images[0] : ''),
        price: item.product.price,
        countInStock: item.product.countInStock,
        qty: item.quantity,
      }));
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Remove from cart (backend)
export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCartAsync',
  async (id, thunkAPI) => {
    try {
      await api.delete('/api/cart/remove', { data: { productId: id } });
      const { data } = await api.get('/api/cart');
      return (data?.items || []).map(item => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.image || (Array.isArray(item.product.images) && item.product.images.length > 0 ? item.product.images[0] : ''),
        price: item.product.price,
        countInStock: item.product.countInStock,
        qty: item.quantity,
      }));
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Clear cart (backend)
export const clearCartAsync = createAsyncThunk(
  'cart/clearCartAsync',
  async (_, thunkAPI) => {
    try {
      await api.delete('/api/cart/clear');
      return [];
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.cartItems = action.payload;
        state.isLoading = false;
        state.isError = false;
        state.message = '';
      })
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cartItems = action.payload;
        state.isLoading = false;
        state.isError = false;
        state.message = '';
      })
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateCartItemQuantityAsync.fulfilled, (state, action) => {
        state.cartItems = action.payload;
        state.isLoading = false;
        state.isError = false;
        state.message = '';
      })
      .addCase(updateCartItemQuantityAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartItemQuantityAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.cartItems = action.payload;
        state.isLoading = false;
        state.isError = false;
        state.message = '';
      })
      .addCase(removeFromCartAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.cartItems = [];
        state.isLoading = false;
        state.isError = false;
        state.message = '';
      })
      .addCase(clearCartAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(clearCartAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { saveShippingAddress, savePaymentMethod } = cartSlice.actions;
export default cartSlice.reducer;
