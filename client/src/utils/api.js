import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? 'https://moohaarapp.onrender.com' // live backend (Render)
    : 'http://localhost:5000',          // local backend
  withCredentials: true, // allow cookies/session
  timeout: 10000,        // 10 sec timeout
});

// Request interceptor to add headers
api.interceptors.request.use(
  (config) => {
    // Get CSRF token from cookies if available
    const csrfToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];

    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network issues
    if (!error.response) {
      return Promise.reject(
        new Error('Network error. Please check your internet connection.')
      );
    }

    // Handle 401 Unauthorized
    if (error.response.status === 401) {
      if (
        window.location.pathname !== '/sufimoohaaradmin/login' &&
        window.location.pathname !== '/sufimoohaaradmin'
      ) {
        window.location.href = '/sufimoohaaradmin/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;