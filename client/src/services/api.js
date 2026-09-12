import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  // Admin routes use adminToken; prefer per-request header if set
  if (config.url?.startsWith('/admin') || config.headers['x-role'] === 'admin') {
    const at = localStorage.getItem('adminToken');
    if (at) config.headers.Authorization = `Bearer ${at}`;
  } else {
    const t = localStorage.getItem('token');
    if (t) config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

export const endpoints = {
  register: (d) => api.post('/auth/register', d),
  login: (d) => api.post('/auth/login', d),
  verifyEmail: (t) => api.get(`/auth/verify-email/${t}`),
  forgot: (d) => api.post('/auth/forgot-password', d),
  reset: (t, d) => api.post(`/auth/reset-password/${t}`, d),
  me: () => api.get('/auth/me'),
  pizzaOptions: () => api.get('/pizza-options'),
  createOrder: (d) => api.post('/orders', d),
  createPayment: (id) => api.post(`/orders/${id}/create-payment`),
  verifyPayment: (id, d) => api.post(`/orders/${id}/verify-payment`, d),
  myOrders: () => api.get('/orders/my'),
  orderDetail: (id) => api.get(`/orders/${id}`),
  adminLogin: (d) => api.post('/admin/auth/login', d),
  adminInventory: () => api.get('/admin/inventory', { headers: { 'x-role': 'admin' } }),
  adminPatchInventory: (id, d) => api.patch(`/admin/inventory/${id}`, d, { headers: { 'x-role': 'admin' } }),
  adminOrders: (status) => api.get(`/admin/orders${status ? `?status=${encodeURIComponent(status)}` : ''}`, { headers: { 'x-role': 'admin' } }),
  adminPatchOrder: (id, d) => api.patch(`/admin/orders/${id}/status`, d, { headers: { 'x-role': 'admin' } }),
};

export default api;
