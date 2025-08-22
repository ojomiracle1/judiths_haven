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

// Add to cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ id, qty }, thunkAPI) => {
    try {
      const { data } = await api.get(`/api/products/${id}`);
      return {
        product: data._id,
        name: data.name,
        image: data.image || (Array.isArray(data.images) && data.images.length > 0 ? data.images[0] : ''),
        price: data.price,
        countInStock: data.countInStock,
        qty,
      };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    updateCartItemQuantity: (state, action) => {
      const { id, qty } = action.payload;
      const item = state.cartItems.find((x) => x.product === id);
      if (item) {
        item.qty = qty;
      }
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (x) => x.product !== action.payload
      );
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    clearCartItems: (state) => {
      state.cartItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        const item = action.payload;
        const existItem = state.cartItems.find(
          (x) => x.product === item.product
        );

        if (existItem) {
          state.cartItems = state.cartItems.map((x) =>
            x.product === existItem.product ? item : x
          );
        } else {
          state.cartItems = [...state.cartItems, item];
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const {
  updateCartItemQuantity,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;