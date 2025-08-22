import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCartAsync, updateCartItemQuantityAsync, fetchCart } from '../features/cart/cartSlice.backend';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useTranslation } from 'react-i18next';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems, isLoading } = useSelector((state) => state.cart);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [removingItems, setRemovingItems] = useState(new Set());
  const { t } = useTranslation();

  const handleQuantityChange = (id, qty) => {
    setUpdatingItems(prev => new Set(prev).add(id));
    dispatch(updateCartItemQuantityAsync({ id, qty }))
      .finally(() => {
        setUpdatingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      });
  };

  const handleRemoveItem = (id) => {
    setRemovingItems(prev => new Set(prev).add(id));
    dispatch(removeFromCartAsync(id))
      .then(() => {
        toast.success('Item removed from cart');
      })
      .finally(() => {
        setRemovingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      });
  };

  const handleCheckout = () => {
    navigate('/shipping');
  };

  React.useEffect(() => {
    AOS.init({ duration: 900, once: true, offset: 40 });
    dispatch(fetchCart()); // Fetch cart from backend on mount
  }, [dispatch]);

  if (isLoading && cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 bg-gradient-to-br from-pink-50 via-white to-blue-50 min-h-screen">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 bg-gradient-to-br from-pink-50 via-white to-blue-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 drop-shadow-lg" data-aos="fade-down">{t('shoppingCart')}</h1>
      {cartItems.length === 0 ? (
        <div className="text-center py-16 bg-white/70 rounded-2xl shadow-inner animate-fade-in" data-aos="fade-up">
          <p className="text-gray-500 mb-4">{t('yourCartIsEmpty')}</p>
          <Link
            to="/products"
            className="btn-gradient"
          >
            {t('continueShopping')}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start gap-8 animate-fade-in" data-aos="fade-up">
          {/* Cart Items */}
          <div className="lg:col-span-7">
            <div className="border-t border-b border-blue-100 divide-y divide-blue-50">
              {cartItems.map((item, idx) => (
                <div key={item.product} className="py-6 flex flex-col sm:flex-row gap-4 animate-fade-in" data-aos="zoom-in" data-aos-delay={100 + idx * 100}>
                  <div className="flex-shrink-0 w-full sm:w-24 h-24 border border-blue-100 rounded-md overflow-hidden mx-auto sm:mx-0 bg-white">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-center object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between text-base font-medium text-gray-800 gap-2">
                        <h3>
                          <Link to={`/product/${item.product}`}>{item.name}</Link>
                        </h3>
                        <p className="sm:ml-4">₦{item.price}</p>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-end justify-between text-sm gap-2 mt-2">
                      <div className="flex items-center">
                        <label htmlFor={`qty-${item.product}`} className="mr-2 text-gray-600">{t('quantity')}:</label>
                        <select
                          id={`qty-${item.product}`}
                          value={item.qty}
                          onChange={(e) => handleQuantityChange(item.product, Number(e.target.value))}
                          className="input-premium w-20"
                          disabled={updatingItems.has(item.product)}
                        >
                          {[...Array(item.countInStock).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </select>
                        {updatingItems.has(item.product) && (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 ml-2"></div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.product)}
                        disabled={removingItems.has(item.product)}
                        className={`bg-gradient-to-r from-red-200 to-pink-200 hover:from-red-300 hover:to-pink-300 text-red-900 font-semibold rounded-lg px-4 py-1 shadow focus:outline-none focus:ring-2 focus:ring-red-200 transition-all duration-150 ${
                          removingItems.has(item.product) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {removingItems.has(item.product) ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600 mr-2"></div>
                            {t('removing')}...
                          </span>
                        ) : (
                          t('remove')
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Order Summary */}
          <div className="mt-8 lg:mt-0 lg:col-span-5 animate-fade-in" data-aos="fade-left">
            <div className="bg-white/80 rounded-2xl p-6 shadow-2xl border border-blue-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t('orderSummary')}</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <p className="text-gray-600">{t('subtotal')}</p>
                  <p className="text-gray-800 font-medium">
                    ₦{cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">{t('shipping')}</p>
                  <p className="text-gray-800 font-medium">{t('calculatedAtCheckout')}</p>
                </div>
                <div className="border-t border-blue-100 pt-4">
                  <div className="flex justify-between">
                    <p className="text-lg font-bold text-gray-800">{t('total')}</p>
                    <p className="text-lg font-bold text-gray-800">
                      ₦{cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full mt-6 btn-gradient text-lg font-semibold"
                >
                  {t('proceedToCheckout')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;