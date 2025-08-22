import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder } from '../features/order/orderSlice';
import { clearCartItems } from '../features/cart/cartSlice';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const orderState = useSelector((state) => state.order);
  const { shippingAddress, paymentMethod, cartItems } = cart;

  // Calculate prices
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
  const totalPrice = (Number(itemsPrice) + Number(shippingPrice) + Number(taxPrice)).toFixed(2);

  useEffect(() => {
    if (!paymentMethod) {
      navigate('/payment');
    }
  }, [paymentMethod, navigate]);

  useEffect(() => {
    if (orderState.order && orderState.order._id) {
      dispatch(clearCartItems());
      navigate(`/order-success/${orderState.order._id}`);
    }
  }, [orderState.order, dispatch, navigate]);

  const placeOrderHandler = () => {
    dispatch(
      createOrder({
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      })
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-pink-600 mb-8 text-center tracking-tight">Place Order</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Order Summary */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-blue-600">Order Items</h2>
              {cartItems.map((item, idx) => (
                <div key={item._id || item.product || idx} className="flex items-center py-4 border-b last:border-b-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-xl bg-pink-50 border border-pink-100 mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-pink-600">{item.name}</h3>
                    <p className="text-gray-500 text-sm">Qty: {item.qty}</p>
                  </div>
                  <div className="text-green-600 font-bold text-lg">${item.price}</div>
                </div>
              ))}
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-blue-600">Shipping</h2>
              <div className="text-gray-700">
                <div>{shippingAddress.address}</div>
                <div>{shippingAddress.city}, {shippingAddress.postalCode}</div>
                <div>{shippingAddress.country}</div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-green-100">
              <h2 className="text-xl font-semibold mb-4 text-green-600">Payment</h2>
              <div className="text-gray-700">{paymentMethod}</div>
            </div>
          </div>
          {/* Order Summary Card */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-yellow-100 sticky top-8">
              <h2 className="text-xl font-semibold mb-4 text-yellow-600">Order Summary</h2>
              <div className="flex justify-between mb-2 text-gray-700">
                <span>Items</span>
                <span>${itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2 text-gray-700">
                <span>Shipping</span>
                <span>${shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2 text-gray-700">
                <span>Tax</span>
                <span>${taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-pink-600 mb-6">
                <span>Total</span>
                <span>${totalPrice}</span>
              </div>
              <button
                onClick={placeOrderHandler}
                className="w-full py-3 px-4 bg-gradient-to-r from-pink-400 via-blue-400 to-green-400 text-white font-bold rounded-xl shadow-lg hover:from-pink-500 hover:to-green-500 transition focus:outline-none focus:ring-2 focus:ring-pink-200"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;