// import axios from 'axios';

// const api = axios.create({
//   baseURL: '/api', // Vite proxy handles the http://localhost:5000 part
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Intercept requests and attach the token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default api;

import axios from 'axios';
import toast from 'react-hot-toast';

// Create the Axios instance
const api = axios.create({
  // Make sure this matches your actual backend URL!
  baseURL: 'http://localhost:5000/api', 
});

// 1. REQUEST INTERCEPTOR: Automatically attach the token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. RESPONSE INTERCEPTOR: The Security Camera for 401 Errors
api.interceptors.response.use(
  (response) => {
    // If the request is successful, just pass it through
    return response;
  },
  (error) => {
    // If the server explicitly says "401 Unauthorized" (Token missing or expired)
    if (error.response && error.response.status === 401) {
      
      // Wipe the invalid credentials from the browser
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Prevent infinite redirect loops if they are already on the login page
      if (window.location.pathname !== '/login') {
        toast.error('Session expired. Please log in again.', {
          icon: '🔒',
          style: { borderRadius: '10px', background: '#333', color: '#fff' }
        });
        
        // Kick them back to the login screen securely
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000); // 1 second delay so they can read the toast!
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;