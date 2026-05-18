import axios from 'axios'

const BASE_URL = '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

export const authApi = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  profile: () => api.get('/auth/profile'),
}

export const entitiesApi = {
  getPublic: (id) => api.get(`/entities/${id}/public`),
  search: (code) => api.get('/entities/search', { params: { code } }),
  list: (params) => api.get('/entities', { params }),
  get: (id) => api.get(`/entities/${id}`),
}

export const inspectionsApi = {
  list: (params) => api.get('/inspections', { params }),
  get: (id) => api.get(`/inspections/${id}`),
  update: (id, data) => api.put(`/inspections/${id}`, data),
}

export const complaintsApi = {
  list: (params) => api.get('/complaints', { params }),
  get: (id) => api.get(`/complaints/${id}`),
  create: (data) => {
    // Transform mobile app field names to backend API field names
    const payload = {
      category: data.category,
      content: data.description || data.content,
      reporterPhone: data.contact || data.reporterPhone,
      entityId: data.entityId,
    }
    return api.post('/complaints', payload)
  },
  handle: (id, data) => api.put(`/complaints/${id}/handle`, data),
}

export const selfInspectionsApi = {
  list: (params) => api.get('/self-inspections', { params }),
  get: (id) => api.get(`/self-inspections/${id}`),
  create: (data) => api.post('/self-inspections', data),
  submit: (id) => api.put(`/self-inspections/${id}/submit`),
}

export const activitiesApi = {
  list: (params) => api.get('/activities', { params }),
  get: (id) => api.get(`/activities/${id}`),
  participate: (id, data) => api.post(`/activities/${id}/participate`, data),
  stats: (id) => api.get(`/activities/${id}/stats`),
  participants: (id) => api.get(`/activities/${id}/participants`),
  getMyParticipations: (params) => api.get('/activities/my/participations', { params }),
}

export const notificationsApi = {
  list: (params) => api.get('/notifications', { params }),
  get: (id) => api.get(`/notifications/${id}`),
  markRead: (id) => api.put(`/notifications/${id}/read`),
}

export const screeningsApi = {
  list: (params) => api.get('/screenings', { params }),
  getMy: (params) => api.get('/screenings/my', { params }),
  get: (id) => api.get(`/screenings/${id}`),
  create: (data) => api.post('/screenings', data),
  update: (id, data) => api.put(`/screenings/${id}`, data),
}

export const infoCorrectionsApi = {
  list: (params) => api.get('/info-corrections', { params }),
  get: (id) => api.get(`/info-corrections/${id}`),
  create: (data) => api.post('/info-corrections', data),
}

export const rectificationsApi = {
  list: (params) => api.get('/rectifications', { params }),
  get: (id) => api.get(`/rectifications/${id}`),
  submit: (id, data) => api.post(`/rectifications/${id}/submit`, data),
}
