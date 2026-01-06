import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:5000/api';          

// Create the Axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Keep this for desktop cookies
});

// Add a Request Interceptor
// This runs BEFORE every request is sent
axiosInstance.interceptors.request.use(
  (config) => {
    // 1. Get the user object from Local Storage
    const user = JSON.parse(localStorage.getItem('user'));

    // 2. If user and token exist, add to Authorization header
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;