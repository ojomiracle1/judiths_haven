// src/utils/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || 'demo-app-id',
};

// Only initialize Firebase if we have the required config
const isFirebaseConfigured = process.env.REACT_APP_FIREBASE_API_KEY && 
                            process.env.REACT_APP_FIREBASE_PROJECT_ID;

let app, messaging;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
} else {
  console.warn('Firebase not configured. Set REACT_APP_FIREBASE_* environment variables.');
}

export { messaging, getToken, onMessage };
