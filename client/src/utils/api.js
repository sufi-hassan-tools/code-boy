const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const apiCall = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

export default apiCall;

