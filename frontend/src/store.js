import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import cartReducer from './features/cart/cartSlice.backend';
import productReducer from './features/product/productSlice';
import orderReducer from './features/order/orderSlice';
import categoryReducer from './features/category/categorySlice';
import userReducer from './features/user/userSlice';
import wishlistReducer from './features/wishlist/wishlistSlice';
import reviewsReducer from './features/reviews/reviewsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    product: productReducer,
    order: orderReducer,
    category: categoryReducer,
    user: userReducer,
    wishlist: wishlistReducer,
    reviews: reviewsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;