// Resolve API base URL automatically. In production the frontend and backend
// are served from the same origin so we can use a relative URL. During
// development the Vite dev server runs on a different port, so default to the
// Express server running on localhost unless a custom `VITE_API_BASE_URL` is
// provided.
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

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

