import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NODE_ENV === 'development'
      ? 'http://localhost:8080/api'
      : 'https://ccshub-systeminteg.azurewebsites.net/api',
    withCredentials: true,
  });

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;