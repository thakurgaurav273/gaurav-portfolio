import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Will use vite proxy or just be careful about ports if running separately
});


if (import.meta.env.DEV) {
  api.defaults.baseURL = 'http://localhost:3000/api';
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('adminToken');
      window.dispatchEvent(new Event('auth-error'));
    }
    return Promise.reject(error);
  }
);

export default api;
