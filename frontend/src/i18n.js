import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      welcome: 'Welcome',
      home: 'Home',
      products: 'Products',
      cart: 'Cart',
      checkout: 'Checkout',
      adminDashboard: 'Admin Dashboard',
      users: 'Users',
      orders: 'Orders',
      totalSales: 'Total Sales',
      recentOrders: 'Recent Orders',
      placeOrder: 'Place Order',
      shippingAddress: 'Shipping Address',
      paymentMethod: 'Payment Method',
      orderItems: 'Order Items',
      couponCode: 'Coupon Code',
      discount: 'Discount',
      finalTotal: 'Final Total',
      // Add more as needed
      addToCart: 'Add to Cart',
      remove: 'Remove',
      quantity: 'Quantity',
      price: 'Price',
      subtotal: 'Subtotal',
      continueShopping: 'Continue Shopping',
      emptyCart: 'Empty Cart',
      orderSummary: 'Order Summary',
      shipping: 'Shipping',
      tax: 'Tax',
      total: 'Total',
      payNow: 'Pay Now',
      success: 'Success',
      error: 'Error',
      loading: 'Loading',
    },
  },
  fr: {
    translation: {
      welcome: 'Bienvenue',
      home: 'Accueil',
      products: 'Produits',
      cart: 'Panier',
      checkout: 'Paiement',
      adminDashboard: 'Tableau de bord admin',
      users: 'Utilisateurs',
      orders: 'Commandes',
      totalSales: 'Ventes totales',
      recentOrders: 'Commandes récentes',
      placeOrder: 'Passer la commande',
      shippingAddress: 'Adresse de livraison',
      paymentMethod: 'Mode de paiement',
      orderItems: 'Articles commandés',
      couponCode: 'Code promo',
      discount: 'Remise',
      finalTotal: 'Total final',
      // Add more as needed
      addToCart: 'Ajouter au panier',
      remove: 'Retirer',
      quantity: 'Quantité',
      price: 'Prix',
      subtotal: 'Sous-total',
      continueShopping: 'Continuer les achats',
      emptyCart: 'Vider le panier',
      orderSummary: 'Résumé de la commande',
      shipping: 'Livraison',
      tax: 'Taxe',
      total: 'Total',
      payNow: 'Payer maintenant',
      success: 'Succès',
      error: 'Erreur',
      loading: 'Chargement',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 