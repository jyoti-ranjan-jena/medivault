import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Vite proxy handles the http://localhost:5000 part
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests and attach the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;