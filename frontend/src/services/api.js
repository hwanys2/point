import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://classpoint.kr/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 자동 추가
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

// 응답 인터셉터: 인증 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Classrooms API
export const classroomsAPI = {
  getAll: () => api.get('/classrooms'),
  create: (data) => api.post('/classrooms', data),
  update: (id, data) => api.put(`/classrooms/${id}`, data),
  delete: (id) => api.delete(`/classrooms/${id}`),
};

// Students API
export const studentsAPI = {
  getAll: () => api.get('/students'),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  bulkUpload: (students) => api.post('/students/bulk-upload', { students }),
};

// Rules API
export const rulesAPI = {
  getAll: () => api.get('/rules'),
  create: (data) => api.post('/rules', data),
  update: (id, data) => api.put(`/rules/${id}`, data),
  delete: (id) => api.delete(`/rules/${id}`),
};

// Scores API
export const scoresAPI = {
  toggle: (data) => api.post('/scores/toggle', data),
  getByDate: (date) => api.get(`/scores/date/${date}`),
};

// Settings API
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

// Student Managers API
export const studentManagersAPI = {
  getAll: () => api.get('/student-managers'),
  create: (data) => api.post('/student-managers', data),
  update: (id, data) => api.put(`/student-managers/${id}`, data),
  delete: (id) => api.delete(`/student-managers/${id}`),
};

// Public API (no auth required)
export const publicAPI = {
  getLeaderboard: (token, params = {}) => {
    return api.get(`/public/leaderboard/${token}`, { params });
  },
};

export default api;
