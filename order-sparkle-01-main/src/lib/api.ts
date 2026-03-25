import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || 'demo-token-no-auth';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on 401 since we're in demo mode
    if (error.response?.status === 401 && localStorage.getItem('token') !== 'demo-token-no-auth') {
      localStorage.removeItem('token');
      localStorage.removeItem('restaurant');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
};

// Menu APIs
export const menuAPI = {
  addItem: (data) => api.post('/menu', data),
  getItems: () => api.get('/menu'),
  getByCategory: (category) => api.get(`/menu/category/${category}`),
  updateItem: (id, data) => api.put(`/menu/${id}`, data),
  deleteItem: (id) => api.delete(`/menu/${id}`),
  applyGlobalDiscount: (discount) => api.post('/menu/discount/apply-global', { discountPercentage: discount }),
};

// Order APIs
export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (orderId) => api.get(`/orders/${orderId}`),
  editOrder: (orderId, data) => api.put(`/orders/${orderId}`, data),
  markAsPaid: (orderId) => api.post(`/orders/${orderId}/mark-paid`),
  cancelOrder: (orderId) => api.post(`/orders/${orderId}/cancel`),
  verifyPayment: (data) => api.post('/orders/payment/verify', data),
};

// Sales APIs
export const salesAPI = {
  getDailySales: (date) => api.get('/sales/daily', { params: { date } }),
  getWeeklySales: () => api.get('/sales/weekly'),
  getMonthlySales: (month, year) => api.get('/sales/monthly', { params: { month, year } }),
  getTopItems: (days) => api.get('/sales/top-items', { params: { days } }),
  getCategorySales: (days) => api.get('/sales/category-sales', { params: { days } }),
};

export default api;
