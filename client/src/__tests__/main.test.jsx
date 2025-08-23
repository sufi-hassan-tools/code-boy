import React from 'react';
import { render } from '@testing-library/react';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock ReactDOM
const mockCreateRoot = jest.fn();
const mockRender = jest.fn();
jest.mock('react-dom/client', () => ({
  createRoot: mockCreateRoot.mockReturnValue({
    render: mockRender
  })
}));

// Mock environment variables
const originalEnv = process.env;
const originalImportMeta = global.importMeta;

beforeEach(() => {
  jest.clearAllMocks();
  process.env = { ...originalEnv };
  global.importMeta = { env: {} };
});

afterEach(() => {
  process.env = originalEnv;
  global.importMeta = originalImportMeta;
});

describe('main.jsx', () => {
  it('configures axios with default settings', async () => {
    // Mock successful CSRF token request
    axios.get.mockResolvedValue({});
    
    // Import main.jsx to trigger the configuration
    await import('../main.jsx');
    
    expect(axios.defaults.withCredentials).toBe(true);
    expect(axios.defaults.xsrfCookieName).toBe('XSRF-TOKEN');
    expect(axios.defaults.xsrfHeaderName).toBe('X-CSRF-Token');
  });

  it('sets axios base URL when VITE_API_URL is provided', async () => {
    global.importMeta.env = { VITE_API_URL: 'https://api.example.com' };
    
    await import('../main.jsx');
    
    expect(axios.defaults.baseURL).toBe('https://api.example.com');
  });

  it('does not set axios base URL when VITE_API_URL is not provided', async () => {
    global.importMeta.env = {};
    
    await import('../main.jsx');
    
    expect(axios.defaults.baseURL).toBeUndefined();
  });

  it('requests CSRF token in non-test environment', async () => {
    process.env.NODE_ENV = 'development';
    axios.get.mockResolvedValue({});
    
    await import('../main.jsx');
    
    expect(axios.get).toHaveBeenCalledWith('/api/csrf-token');
  });

  it('does not request CSRF token in test environment', async () => {
    process.env.NODE_ENV = 'test';
    
    await import('../main.jsx');
    
    expect(axios.get).not.toHaveBeenCalledWith('/api/csrf-token');
  });

  it('creates root and renders app', async () => {
    await import('../main.jsx');
    
    expect(mockCreateRoot).toHaveBeenCalledWith(document.getElementById('root'));
    expect(mockRender).toHaveBeenCalled();
  });

  it('configures axios interceptor for 401 responses', async () => {
    const mockInterceptor = jest.fn();
    axios.interceptors = {
      response: {
        use: mockInterceptor
      }
    };
    
    await import('../main.jsx');
    
    expect(mockInterceptor).toHaveBeenCalled();
  });
});