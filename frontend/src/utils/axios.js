import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api', // Use env variable or fallback to proxy path
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensure cookies are sent with requests
});

// Helper to refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const user = JSON.parse(localStorage.getItem('user'));
    // If 401 and not already trying to refresh
    if (error.response && error.response.status === 401 && !originalRequest._retry && user) {
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const res = await api.post('/auth/refresh'); // Backend should set new access token in cookie or return it
        const newToken = res.data?.accessToken;
        if (newToken) {
          // Update user in localStorage
          localStorage.setItem('user', JSON.stringify({ ...user, token: newToken }));
          api.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
          processQueue(null, newToken);
          return api(originalRequest);
        } else {
          processQueue('No new token', null);
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    // Improved error logging
    const message = error?.response?.data?.message || error.message || 'API Error';
    // Optionally show a toast if available
    if (window?.toast) window.toast.error(message);
    // Log to console for devs
    console.error('API Error:', message, error);
    return Promise.reject(error);
  }
);

export default api;