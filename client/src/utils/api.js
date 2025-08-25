import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://moohaarapp.onrender.com' 
    : 'http://localhost:5000',
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor to add common headers
api.interceptors.request.use(
  (config) => {
    // Add CSRF token if available
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
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

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    // Handle specific error cases
    if (error.response.status === 401) {
      // Redirect to login if unauthorized
      if (window.location.pathname !== '/sufimoohaaradmin/login' && 
          window.location.pathname !== '/sufimoohaaradmin') {
        window.location.href = '/sufimoohaaradmin/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;