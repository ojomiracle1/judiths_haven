import React, { useEffect, useState } from 'react';
import { getToken } from 'firebase/messaging';
import { messaging } from '../utils/firebase';
import { useSelector } from 'react-redux';

const NotificationBell = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [tokenSent, setTokenSent] = useState(false);
  const [error, setError] = useState(null);
  const [isFirebaseAvailable, setIsFirebaseAvailable] = useState(false);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    // Check if Firebase is available
    if (!messaging) {
      setError('Push notifications not configured');
      return;
    }
    setIsFirebaseAvailable(true);
  }, []);

  useEffect(() => {
    if (permission === 'granted' && user && !tokenSent && isFirebaseAvailable) {
      const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;
      
      if (!vapidKey) {
        setError('Push notifications not configured');
        return;
      }

      getToken(messaging, { vapidKey })
        .then((currentToken) => {
          if (currentToken) {
            fetch('/device-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`,
              },
              body: JSON.stringify({ token: currentToken }),
            })
              .then((res) => {
                if (!res.ok) {
                  throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }
                setTokenSent(true);
                setError(null);
              })
              .catch((err) => {
                console.error('Device token registration failed:', err);
                setError('Failed to register device token');
              });
          } else {
            setError('No registration token available');
          }
        })
        .catch((err) => {
          console.error('Firebase token error:', err);
          setError('Failed to get notification token');
        });
    }
  }, [permission, user, tokenSent, isFirebaseAvailable]);

  const handleClick = () => {
    if (!isFirebaseAvailable) {
      setError('Push notifications not configured');
      return;
    }

    if (permission !== 'granted') {
      Notification.requestPermission().then((perm) => {
        setPermission(perm);
        if (perm !== 'granted') {
          setError('Notification permission denied');
        }
      });
    }
  };

  // Don't render if Firebase is not available
  if (!isFirebaseAvailable) {
    return null;
  }

  return (
    <div
      className="relative flex items-center justify-center cursor-pointer select-none group"
      onClick={handleClick}
      title="Enable push notifications"
    >
      <svg
        className="w-8 h-8 transition-colors duration-200 group-hover:scale-110 group-hover:drop-shadow-lg"
        fill={permission === 'granted' ? '#6ee7b7' : '#a7b6c2'}
        viewBox="0 0 24 24"
      >
        <path d="M12 2C8.13 2 5 5.13 5 9v5H3v2h18v-2h-2V9c0-3.87-3.13-7-7-7zm0 18c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z" />
      </svg>
      {error && (
        <span className="absolute left-1/2 -translate-x-1/2 top-10 text-xs text-pink-500 whitespace-nowrap bg-white/90 px-3 py-1 rounded-xl shadow-card-haven z-10 border border-pink-100">
          {error}
        </span>
      )}
      {tokenSent && (
        <span className="absolute left-1/2 -translate-x-1/2 top-10 text-xs text-emerald-500 whitespace-nowrap bg-white/90 px-3 py-1 rounded-xl shadow-card-haven z-10 border border-emerald-100">
          Enabled
        </span>
      )}
    </div>
  );
};

export default NotificationBell;
