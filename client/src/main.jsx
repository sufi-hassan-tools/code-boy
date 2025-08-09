import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';

// Configure axios base URL from Vite env for CI/preview builds
const apiBaseUrl = (import.meta.env && import.meta.env.VITE_API_URL) ? String(import.meta.env.VITE_API_URL).trim() : '';
if (apiBaseUrl) {
  axios.defaults.baseURL = apiBaseUrl;
}

axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
axios.defaults.xsrfHeaderName = 'X-CSRF-Token';

let refreshPromise = null;

axios.interceptors.response.use(
  res => res,
  async err => {
    const { response, config } = err;
    if (response && response.status === 401 && !config._retry) {
      config._retry = true;
      try {
        refreshPromise = refreshPromise || axios.post('/api/auth/refresh');
        await refreshPromise;
        refreshPromise = null;
        return axios(config);
      } catch (refreshErr) {
        refreshPromise = null;
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(err);
  }
);

// Prime CSRF token cookie for the session
if (process.env.NODE_ENV !== 'test') {
  axios.get('/api/csrf-token');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
