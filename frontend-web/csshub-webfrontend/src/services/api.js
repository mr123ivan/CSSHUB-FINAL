import axios from 'axios';

const api = axios.create({
  baseURL: 'https://ccshub-systeminteg.azurewebsites.net',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a function to decode JWT token for debugging
const decodeJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

api.interceptors.request.use(
  (config) => {
    // Don't add auth header for public endpoints or admin operations
    const isPublicEndpoint = 
      // Auth endpoints
      config.url.includes('/api/auth/login') || 
      config.url.includes('/api/auth/register') ||
      // Public data endpoints
      config.url.includes('/api/events') ||
      config.url.includes('/api/merchandises') ||
      config.url.includes('/api/orders/create') ||
      config.url.includes('/api/orders/payment') ||
      config.url.includes('/api/payments') ||
      // Admin endpoints - will rely on basic auth instead of OAuth
      config.url.includes('/api/admins') ||
      config.url.includes('/api/orders/edit') ||
      config.url.includes('/api/orders/receipt-image');
      
    if (!isPublicEndpoint) {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Log token validity info for debugging
        const decoded = decodeJwt(token);
        if (decoded) {
          const currentTime = Math.floor(Date.now() / 1000);
          console.log('Token valid:', decoded.exp > currentTime, 
                      'Expires:', new Date(decoded.exp * 1000).toLocaleString());
        }
        
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized request, consider logging out:', error);
      
      // Provide more detailed debugging info
      const token = localStorage.getItem('access_token');
      if (token) {
        const decoded = decodeJwt(token);
        console.log('Current token payload:', decoded);
      } else {
        console.log('No access token found in localStorage');
      }
    }
    return Promise.reject(error);
  }
);

export default api;