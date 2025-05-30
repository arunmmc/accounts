// src/utils/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api/', // **IMPORTANT: Set this to your Django backend API URL**
  timeout: 5000, // Request timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add the JWT token to headers if available
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken'); // Retrieve token from localStorage
    if (token) {
      // Adjust 'Bearer' if your DRF authentication uses 'Token'
      // For simplejwt, 'Bearer' is correct
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401 Unauthorized errors (e.g., token expired)
// You might want to add Redux logout dispatch here eventually
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized: Token expired or invalid. Attempting logout...');
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken'); // Also remove refresh token
      // You would dispatch a logout action from your Redux store here
      // import { store } from '../redux/store';
      // store.dispatch(logout()); // Assuming you import 'logout' action
      // window.location.href = '/login'; // Or use navigate from react-router-dom
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;