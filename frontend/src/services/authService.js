import api from './api';

// Auth endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
};

export const getCurrentUser = async () => {
  try {
    const response = await authAPI.getProfile();
    return response.data;
  } catch (error) {
    throw error;
  }
};
