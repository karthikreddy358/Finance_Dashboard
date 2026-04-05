import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach bearer token when available. This avoids cross-site cookie edge cases.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Request Failed:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          console.error('Unauthorized - redirecting to login');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Forbidden - insufficient permissions');
          alert('You do not have permission to perform this action');
          break;
        case 404:
          console.error('Resource not found');
          alert('The requested resource was not found');
          break;
        default:
          const message = data?.message || 'An error occurred';
          alert(`Error: ${message}`);
      }
    } else if (error.request) {
      console.error('No response from server - is the backend running?');
      alert(`Cannot connect to server. Please make sure the backend is running at ${API_URL}`);
    } else {
      console.error('Request setup error:', error.message);
      alert(`Request error: ${error.message}`);
    }
    return Promise.reject(error);
  }
);

export default api;
