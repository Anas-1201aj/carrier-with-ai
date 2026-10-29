import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
})

// Auth endpoints
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
}

// Profile endpoints
export const profileApi = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
}

// Career assessment endpoints
export const assessmentApi = {
  get: () => api.get('/assessment'),
  submit: (data) => api.post('/assessment', data),
}

// Roadmap endpoints
export const roadmapApi = {
  get: () => api.get('/roadmap'),
  getPaths: () => api.get('/roadmap/paths'),
  generate: (pathId) => api.post('/roadmap', { pathId }),
  toggleMilestone: (index) => api.patch(`/roadmap/milestones/${index}`),
}

// Resume endpoints
export const resumeApi = {
  list: () => api.get('/resume'),
  upload: (formData) => api.post('/resume/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  analyze: (id, targetRole) => api.post(`/resume/${id}/analyze`, { targetRole }),
  getAnalysis: (id) => api.get(`/resume/${id}/analysis`),
}

// Job match endpoints
export const jobMatchApi = {
  match: (data) => api.post('/jobmatch', data),
  history: () => api.get('/jobmatch'),
}

// Skill assessment endpoints
export const skillApi = {
  list: () => api.get('/skillassessment'),
  getSkills: () => api.get('/skillassessment/skills'),
  start: (skill, level) => api.post('/skillassessment/start', { skill, level }),
  submit: (id, answers) => api.post(`/skillassessment/${id}/submit`, { answers }),
}

// Mock interview endpoints
export const interviewApi = {
  list: () => api.get('/interview'),
  start: (data) => api.post('/interview/start', data),
  get: (id) => api.get(`/interview/${id}`),
  sendMessage: (id, content) => api.post(`/interview/${id}/message`, { content }),
  complete: (id) => api.post(`/interview/${id}/complete`),
}

// Mentor endpoints
export const mentorApi = {
  list: () => api.get('/mentor'),
  start: (topic) => api.post('/mentor', { topic }),
  get: (id) => api.get(`/mentor/${id}`),
  sendMessage: (id, content) => api.post(`/mentor/${id}/message`, { content }),
}

// Project endpoints
export const projectApi = {
  list: () => api.get('/project'),
  generate: (data) => api.post('/project/generate', data),
  save: (data) => api.post('/project', data),
  update: (id, data) => api.patch(`/project/${id}`, data),
  remove: (id) => api.delete(`/project/${id}`),
}

// Job tracker endpoints
export const jobsApi = {
  list: () => api.get('/jobs'),
  add: (data) => api.post('/jobs', data),
  update: (id, data) => api.patch(`/jobs/${id}`, data),
  remove: (id) => api.delete(`/jobs/${id}`),
}

// Notifications endpoints
export const notificationsApi = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  remove: (id) => api.delete(`/notifications/${id}`),
}

// Admin API (uses same base)
export const adminApi = {
  dashboard: () => api.get('/admin/dashboard'),
  analytics: (from, to) => api.get('/admin/analytics', { params: { from, to } }),
  students: (params) => api.get('/admin/students', { params }),
  student: (id) => api.get(`/admin/students/${id}`),
  setStatus: (id, status) => api.patch(`/admin/students/${id}/status`, { status }),
  auditLogs: (page) => api.get('/admin/audit-logs', { params: { page } }),
  getSettings: () => api.get('/admin/settings'),
  saveSettings: (data) => api.patch('/admin/settings', data),
}

export default api
