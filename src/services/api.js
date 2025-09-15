import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://fin-tech-server.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const transactionAPI = {
  getTransactions: () => api.get('/transactions'),
  addTransaction: (transaction) => api.post('/transactions', transaction),
  updateTransaction: (id, transaction) => api.put(`/transactions/${id}`, transaction),
  deleteTransaction: (id) => api.delete(`/transactions/${id}`),
  getSpendingStats: (period = 'month') => api.get(`/transactions/stats?period=${period}`),
};

export const transferAPI = {
  getTransfers: () => api.get('/transfers'),
  sendTransfer: (transfer) => api.post('/transfers', transfer),
  getUsers: () => api.get('/transfers/users'),
};

export const alertAPI = {
  getAlerts: () => api.get('/alerts'),
  markAsRead: (id) => api.put(`/alerts/${id}/read`),
  updateSettings: (settings) => api.put('/alerts/settings', settings),
  getSettings: () => api.get('/alerts/settings'),
};