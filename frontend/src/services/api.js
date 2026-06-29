import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_PREFIX = '/api';

const api = axios.create({
  baseURL: API_BASE_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

const buildApiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return normalizedPath.startsWith(API_PREFIX)
    ? normalizedPath
    : `${API_PREFIX}${normalizedPath}`;
};

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      // Will be caught by AuthContext
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ───────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post(buildApiUrl('/auth/register'), data),
  login: (data) => api.post(buildApiUrl('/auth/login'), data),
  getMe: () => api.get(buildApiUrl('/auth/me')),
};

// ─── Opportunities API ──────────────────────────────────────────
export const opportunitiesAPI = {
  getAll: (params) => api.get(buildApiUrl('/opportunities'), { params }),
  getOne: (id) => api.get(buildApiUrl(`/opportunities/${id}`)),
  create: (data) => api.post(buildApiUrl('/opportunities'), data),
  update: (id, data) => api.put(buildApiUrl(`/opportunities/${id}`), data),
  delete: (id) => api.delete(buildApiUrl(`/opportunities/${id}`)),
};

export default api;
