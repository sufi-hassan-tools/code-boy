// Use relative URL by default so frontend and backend can run on the same host
// without needing environment configuration. A custom base URL can still be
// provided via VITE_API_BASE_URL when required.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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
    return {
      ok: false,
      status: 0,
      data: { msg: error.message },
    };
  }
};

export default apiCall;

