# Firebase Push Notifications Setup

## To fix the "Failed to register device token" error:

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Cloud Messaging

### 2. Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" → Web app
4. Copy the config values

### 3. Create Environment File
Create a `.env` file in the `frontend` folder with:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_VAPID_KEY=your_vapid_key_here
```

### 4. Get VAPID Key
1. In Firebase Console, go to Project Settings
2. Click "Cloud Messaging" tab
3. Generate a new Web Push certificate
4. Copy the VAPID key to your `.env` file

### 5. Update Service Worker
Update `public/firebase-messaging-sw.js` with your actual Firebase config.

### 6. Restart Frontend
After adding the environment variables, restart your React app.

## Current Status
- ✅ Backend route is working
- ✅ Frontend error handling improved
- ⚠️ Need Firebase configuration to complete setup

The notification bell will be hidden until Firebase is properly configured. 