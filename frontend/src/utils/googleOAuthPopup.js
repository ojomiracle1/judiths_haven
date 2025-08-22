// Utility to open a popup and receive a message from the popup window
export function openGoogleOAuthPopup({ url, onSuccess, onError }) {
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  const popup = window.open(
    url,
    'GoogleOAuth',
    `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars=yes`
  );
  if (!popup) {
    onError && onError('Popup blocked');
    return;
  }
  // Listen for message from popup
  function handleMessage(event) {
    // Only accept messages from our backend origin
    const backendUrl = process.env.NODE_ENV === 'production' ? 'https://judiths-haven-backend.onrender.com' : process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';
    if (event.origin !== backendUrl) return;
    if (event.data && event.data.type === 'google-auth-success') {
      onSuccess(event.data.payload);
      window.removeEventListener('message', handleMessage);
      popup.close();
    } else if (event.data && event.data.type === 'google-auth-error') {
      onError && onError(event.data.payload);
      window.removeEventListener('message', handleMessage);
      popup.close();
    }
  }
  window.addEventListener('message', handleMessage);
}
