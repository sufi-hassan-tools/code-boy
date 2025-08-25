// client/src/utils/api.js
import axios from 'axios';

/**
 * Safe env var reader across CRA/Vite/Next
 */
function readEnv(key) {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key] !== undefined) {
    return import.meta.env[key];
  }
  return undefined;
}

function resolveBaseURL() {
  // Runtime override for debugging
  if (typeof window !== 'undefined' && window.__API_URL__) {
    return window.__API_URL__;
  }

  const envUrl =
    readEnv('REACT_APP_API_URL') || // CRA
    readEnv('VITE_API_URL') ||      // Vite
    readEnv('NEXT_PUBLIC_API_URL'); // Next.js

  const fallback =
    process.env.NODE_ENV === 'production'
      ? 'https://moohaarapp.onrender.com'
      : 'http://localhost:5000';

  const raw = envUrl || fallback;
  return raw.replace(/\/+$/, ''); // remove trailing slash
}

export const API_BASE_URL = resolveBaseURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
});

// Request interceptor: CSRF token
api.interceptors.request.use(
  (config) => {
    if (typeof document !== 'undefined') {
      const csrfToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    if (error.response.status === 401) {
      if (
        typeof window !== 'undefined' &&
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