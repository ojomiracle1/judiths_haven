/* eslint-env serviceworker */
/* global firebase */

/*
  firebase-messaging-sw.js
  Service Worker for Firebase Cloud Messaging
*/

// Firebase messaging service worker
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

// Check if Firebase config is available
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Only initialize if we have a real config
const hasRealConfig = firebaseConfig.apiKey !== "YOUR_API_KEY";

if (hasRealConfig) {
  try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Handle background messages
    messaging.onBackgroundMessage(function(payload) {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo192.png',
      };

      // eslint-disable-next-line no-restricted-globals
      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  } catch (error) {
    console.warn('Firebase service worker initialization failed:', error);
  }
} else {
  console.warn('Firebase not configured in service worker. Update firebase-messaging-sw.js with your config.');
}
