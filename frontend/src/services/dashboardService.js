import api from './api';

export const dashboardAPI = {
  getStats: (params) => api.get('/dashboard/stats', { params }),
  getCategories: (params) => api.get('/dashboard/categories', { params }),
  getTrends: (params) => api.get('/dashboard/trends', { params }),
};
