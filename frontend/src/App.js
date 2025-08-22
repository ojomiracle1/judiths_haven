import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { HelmetProvider } from 'react-helmet-async';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/layout/AdminLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Shipping from './pages/Shipping';
import Payment from './pages/Payment';
import PlaceOrder from './pages/PlaceOrder';
import OrderSuccess from './pages/OrderSuccess';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import NotFound from './pages/NotFound';
import CategoryDetails from './pages/CategoryDetails';
import ProductList from './pages/ProductList';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Wishlist from './pages/Wishlist';
import ContactPage from './pages/ContactPage';
import RecommendedPage from './pages/RecommendedPage';
import RecentlyViewedPage from './pages/RecentlyViewedPage';

// Admin Pages (code-split for performance)
const AdminOrderList = lazy(() => import('./pages/admin/OrderList'));
const AdminProductList = lazy(() => import('./pages/admin/ProductList'));
const AdminUserList = lazy(() => import('./pages/admin/UserList'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const UserForm = lazy(() => import('./pages/admin/UserForm'));
const CategoryList = lazy(() => import('./pages/admin/CategoryList'));
const CategoryForm = lazy(() => import('./pages/admin/CategoryForm'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const AdminContactMessages = lazy(() => import('./pages/admin/AdminContactMessages'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'));

const ScrollToTop = () => {
  const { pathname } = require('react-router-dom').useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  const location = useLocation();
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main id="main-content" className="flex-grow pt-20 sm:pt-24" tabIndex="-1">
            {/* Suspense fallback for lazy-loaded admin pages */}
            <Suspense fallback={<div className="flex justify-center items-center h-64">Loading...</div>}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/category/:id" element={<CategoryDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/recommended" element={<RecommendedPage />} />
                <Route path="/recently-viewed" element={<RecentlyViewedPage />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/shipping" element={<Shipping />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/placeorder" element={<PlaceOrder />} />
                  <Route path="/order-success/:id" element={<OrderSuccess />} />
                  <Route path="/my-orders" element={<MyOrders />} />
                  <Route path="/order/:id" element={<OrderDetails />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<AdminRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/products" element={<AdminProductList />} />
                    <Route path="/admin/product/new" element={<ProductForm />} />
                    <Route path="/admin/product/:id/edit" element={<ProductForm />} />
                    <Route path="/admin/users" element={<AdminUserList />} />
                    <Route path="/admin/user/new" element={<UserForm />} />
                    <Route path="/admin/user/:id/edit" element={<UserForm />} />
                    <Route path="/admin/orders" element={<AdminOrderList />} />
                    <Route path="/admin/order/:id" element={<OrderDetails />} />
                    <Route path="/admin/categories" element={<CategoryList />} />
                    <Route path="/admin/categories/create" element={<CategoryForm />} />
                    <Route path="/admin/categories/edit/:id" element={<CategoryForm />} />
                    <Route path="/admin/user-management" element={<UserManagement />} />
                    <Route path="/admin/messages" element={<AdminContactMessages />} />
                    <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
                  </Route>
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          {location.pathname === '/' && <Footer />}
          <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick={true} rtl={false} pauseOnFocusLoss={true} draggable={true} pauseOnHover={true} />
        </div>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;