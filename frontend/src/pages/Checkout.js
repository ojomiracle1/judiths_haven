import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import api from '../src/utils/axios';
import { createOrder } from '../features/order/orderSlice';
import { clearCartItems } from '../features/cart/cartSlice';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const Checkout = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [payment, setPayment] = useState({ method: 'card' });
  const navigate = useNavigate();

  const [addressErrors, setAddressErrors] = useState({});
  const [paymentErrors, setPaymentErrors] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [couponInfo, setCouponInfo] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const dispatch = useDispatch();
  const [orderError, setOrderError] = useState('');
  const [shippingPrice, setShippingPrice] = useState(0);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState('');

  const { t } = useTranslation();

  const addressSchema = yup.object().shape({
    fullName: yup.string().required('Full Name is required'),
    address: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    postalCode: yup.string().required('Postal Code is required'),
    country: yup.string().required('Country is required'),
  });
  const paymentSchema = yup.object().shape({
    method: yup.string().required('Payment method is required'),
  });

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    setPayment({ ...payment, [e.target.name]: e.target.value });
  };

  const handleNext = async () => {
    if (step === 1) {
      try {
        await addressSchema.validate(address, { abortEarly: false });
        setAddressErrors({});
        // Calculate shipping after address is valid
        setShippingLoading(true);
        setShippingError('');
        try {
          const res = await api.post('/shipping/calculate', {
            address,
            cartItems,
          });
          setShippingPrice(res.data.shippingPrice);
        } catch (err) {
          setShippingError(err.response?.data?.message || 'Failed to calculate shipping');
          setShippingPrice(0);
        } finally {
          setShippingLoading(false);
        }
        setStep((s) => s + 1);
      } catch (validationError) {
        const newErrors = {};
        validationError.inner.forEach(err => {
          newErrors[err.path] = err.message;
        });
        setAddressErrors(newErrors);
      }
    } else if (step === 2) {
      try {
        await paymentSchema.validate(payment, { abortEarly: false });
        setPaymentErrors({});
        setStep((s) => s + 1);
      } catch (validationError) {
        const newErrors = {};
        validationError.inner.forEach(err => {
          newErrors[err.path] = err.message;
        });
        setPaymentErrors(newErrors);
      }
    }
  };
  const handleBack = () => setStep((s) => s - 1);

  const handleValidateCoupon = async () => {
    setValidatingCoupon(true);
    setCouponError('');
    setCouponInfo(null);
    try {
  const res = await api.post('/coupons/validate', { code: couponCode });
      setCouponInfo(res.data.coupon);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
    setOrderError('');
    try {
      const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
      const taxPrice = 0; // You can adjust this logic
      const totalPrice = itemsPrice + shippingPrice + taxPrice;
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item.product,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.qty,
          size: item.size,
          color: item.color,
        })),
        shippingAddress: {
          address: address.address,
          city: address.city,
          postalCode: address.postalCode,
          country: address.country,
        },
        paymentMethod: payment.method,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        couponCode: couponInfo ? couponInfo.code : undefined,
      };
      const result = await dispatch(createOrder(orderData)).unwrap();
      dispatch(clearCartItems());
      navigate(`/order-success/${result._id}`);
    } catch (err) {
      setOrderError(err.message || 'Failed to place order');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 bg-gradient-to-br from-pink-50 via-white to-blue-50 min-h-screen">
      <Helmet>
        <title>Checkout - Judith's Haven</title>
        <meta name="description" content="Secure checkout for your Judith's Haven order. Enter your shipping and payment details to complete your purchase." />
        <link rel="canonical" href="https://yourdomain.com/checkout" />
      </Helmet>
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 drop-shadow-lg text-center">{t('checkout')}</h1>
      <div className="flex justify-center mb-10">
        <div className="flex gap-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${step >= 1 ? 'bg-blue-200 text-blue-900' : 'bg-gray-200 text-gray-400'}`}>1</div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${step >= 2 ? 'bg-blue-200 text-blue-900' : 'bg-gray-200 text-gray-400'}`}>2</div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${step === 3 ? 'bg-blue-200 text-blue-900' : 'bg-gray-200 text-gray-400'}`}>3</div>
        </div>
      </div>
      <div className="bg-white/80 rounded-2xl shadow-2xl p-8 border border-blue-100">
        {step === 1 && (
          <form className="space-y-6">
            <h2 className="text-xl font-bold text-primary-700 mb-4">{t('shippingAddress')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-base font-semibold text-primary-700 mb-1">{t('fullName')}</label>
                <input name="fullName" value={address.fullName} onChange={handleAddressChange} className="input-premium w-full" required />
                {addressErrors.fullName && <div className="text-red-500 text-sm mt-1">{addressErrors.fullName}</div>}
              </div>
              <div>
                <label className="block text-base font-semibold text-primary-700 mb-1">{t('address')}</label>
                <input name="address" value={address.address} onChange={handleAddressChange} className="input-premium w-full" required />
                {addressErrors.address && <div className="text-red-500 text-sm mt-1">{addressErrors.address}</div>}
              </div>
              <div>
                <label className="block text-base font-semibold text-primary-700 mb-1">{t('city')}</label>
                <input name="city" value={address.city} onChange={handleAddressChange} className="input-premium w-full" required />
                {addressErrors.city && <div className="text-red-500 text-sm mt-1">{addressErrors.city}</div>}
              </div>
              <div>
                <label className="block text-base font-semibold text-primary-700 mb-1">{t('state')}</label>
                <input name="state" value={address.state} onChange={handleAddressChange} className="input-premium w-full" required />
                {addressErrors.state && <div className="text-red-500 text-sm mt-1">{addressErrors.state}</div>}
              </div>
              <div>
                <label className="block text-base font-semibold text-primary-700 mb-1">{t('postalCode')}</label>
                <input name="postalCode" value={address.postalCode} onChange={handleAddressChange} className="input-premium w-full" required />
                {addressErrors.postalCode && <div className="text-red-500 text-sm mt-1">{addressErrors.postalCode}</div>}
              </div>
              <div>
                <label className="block text-base font-semibold text-primary-700 mb-1">{t('country')}</label>
                <input name="country" value={address.country} onChange={handleAddressChange} className="input-premium w-full" required />
                {addressErrors.country && <div className="text-red-500 text-sm mt-1">{addressErrors.country}</div>}
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="button" className="btn-gradient px-8 py-2" onClick={handleNext}>{t('next')}</button>
            </div>
          </form>
        )}
        {step === 2 && (
          <form className="space-y-6">
            <h2 className="text-xl font-bold text-primary-700 mb-4">{t('paymentMethod')}</h2>
            <div className="flex flex-col gap-4">
              <label className="inline-flex items-center">
                <input type="radio" name="method" value="card" checked={payment.method === 'card'} onChange={handlePaymentChange} className="mr-2" />
                <span className="text-base font-semibold text-primary-700">{t('creditDebitCard')}</span>
              </label>
              <label className="inline-flex items-center">
                <input type="radio" name="method" value="paystack" checked={payment.method === 'paystack'} onChange={handlePaymentChange} className="mr-2" />
                <span className="text-base font-semibold text-primary-700">{t('paystack')}</span>
              </label>
              <label className="inline-flex items-center">
                <input type="radio" name="method" value="cash" checked={payment.method === 'cash'} onChange={handlePaymentChange} className="mr-2" />
                <span className="text-base font-semibold text-primary-700">{t('cashOnDelivery')}</span>
              </label>
              {paymentErrors.method && <div className="text-red-500 text-sm mt-1">{paymentErrors.method}</div>}
            </div>
            <div className="flex justify-between pt-4">
              <button type="button" className="btn-gradient px-8 py-2" onClick={handleBack}>{t('back')}</button>
              <button type="button" className="btn-gradient px-8 py-2" onClick={handleNext}>{t('next')}</button>
            </div>
          </form>
        )}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-primary-700 mb-4">{t('reviewAndPlaceOrder')}</h2>
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-semibold mb-2">{t('shippingAddress')}</h3>
              <div className="text-gray-700">
                <div>{address.fullName}</div>
                <div>{address.address}, {address.city}, {address.state}, {address.postalCode}, {address.country}</div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-semibold mb-2">{t('paymentMethod')}</h3>
              <div className="text-gray-700 capitalize">{payment.method}</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-semibold mb-2">{t('couponCode')}</h3>
              <div className="flex gap-2 items-center mb-2">
                <input
                  type="text"
                  placeholder={t('enterCouponCode')}
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  className="input-premium"
                />
                <button type="button" className="btn-gradient px-4 py-2" onClick={handleValidateCoupon} disabled={validatingCoupon || !couponCode}>
                  {validatingCoupon ? t('validatingCoupon') : t('applyCoupon')}
                </button>
              </div>
              {couponError && <div className="text-red-500 text-sm">{couponError}</div>}
              {couponInfo && (
                <div className="text-green-700 text-sm">
                  {t('couponApplied')}: {couponInfo.code} - {couponInfo.type === 'percent' ? `${couponInfo.value}% ${t('off')}` : `₦${couponInfo.value} ${t('off')}`}
                </div>
              )}
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-semibold mb-2">{t('orderItems')}</h3>
              <ul className="divide-y divide-blue-100">
                {cartItems.map((item) => (
                  <li key={item.product} className="py-2 flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-blue-100" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{item.name}</div>
                      <div className="text-gray-600 text-sm">Qty: {item.qty}</div>
                    </div>
                    <div className="font-bold text-primary-700">₦{item.price}</div>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between mt-4 font-bold text-lg">
                <span>{t('itemsTotal')}:</span>
                <span>₦{cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-2 font-bold text-lg">
                <span>{t('shipping')}:</span>
                {shippingLoading ? (
                  <span>{t('calculatingShipping')}</span>
                ) : shippingError ? (
                  <span className="text-red-500">{shippingError}</span>
                ) : (
                  <span>₦{shippingPrice.toFixed(2)}</span>
                )}
              </div>
              {couponInfo && (
                <div className="flex justify-between mt-2 text-green-700 font-bold text-lg">
                  <span>{t('discount')}:</span>
                  <span>
                    -₦{
                      couponInfo.type === 'percent'
                        ? ((cartItems.reduce((acc, item) => acc + item.price * item.qty, 0) * couponInfo.value) / 100).toFixed(2)
                        : couponInfo.value.toFixed(2)
                    }
                  </span>
                </div>
              )}
              <div className="flex justify-between mt-2 font-bold text-lg">
                <span>{t('finalTotal')}:</span>
                <span>
                  ₦{
                    (
                      cartItems.reduce((acc, item) => acc + item.price * item.qty, 0) +
                      shippingPrice -
                      (couponInfo
                        ? couponInfo.type === 'percent'
                          ? (cartItems.reduce((acc, item) => acc + item.price * item.qty, 0) * couponInfo.value) / 100
                          : couponInfo.value
                        : 0)
                    ).toFixed(2)
                  }
                </span>
              </div>
            </div>
            {orderError && <div className="text-red-500 text-sm mb-2">{orderError}</div>}
            <div className="flex justify-between pt-4">
              <button type="button" className="btn-gradient px-8 py-2" onClick={handleBack}>{t('back')}</button>
              <button type="button" className="btn-gradient px-8 py-2" onClick={handlePlaceOrder}>{t('placeOrder')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
