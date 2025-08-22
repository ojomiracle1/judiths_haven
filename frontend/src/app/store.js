import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import productReducer from '../features/product/productSlice';
import cartReducer from '../features/cart/cartSlice';
import userReducer from '../features/user/userSlice';
import orderReducer from '../features/order/orderSlice';
import categoryReducer from '../features/category/categorySlice';
import reviewsReducer from '../features/reviews/reviewsSlice';
import CouponList from '../pages/admin/CouponList';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    cart: cartReducer,
    user: userReducer,
    order: orderReducer,
    category: categoryReducer,
    reviews: reviewsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});