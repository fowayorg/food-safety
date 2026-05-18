import axios from 'axios'

const API_BASE_URL = 'http://localhost:5100/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器：添加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器：统一处理错误
api.interceptors.response.use(
  (response) => {
    console.log('API响应:', response.status)
    return response.data
  },
  (error) => {
    console.error('API错误:', error.response?.status, error.response?.data)
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// 导出各个模块的 API 函数
export const authApi = {
  login: (username: string, password: string) => api.post('/auth/login', { username, password }),
  register: (data: any) => api.post('/auth/register', data),
  profile: () => api.get('/auth/profile'),
}

export const usersApi = {
  list: (params?: any) => api.get('/users', { params }),
  get: (id: number) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
  batchDelete: (ids: string[]) => api.post('/users/batch-delete', { ids }),
  getInspectors: () => api.get('/users/inspectors'),
  getScreeners: () => api.get('/users/screeners'),
}

export const streetsApi = {
  list: (params?: any) => api.get('/streets', { params }),
  get: (id: number) => api.get(`/streets/${id}`),
  create: (data: any) => api.post('/streets', data),
  update: (id: number, data: any) => api.put(`/streets/${id}`, data),
  delete: (id: number) => api.delete(`/streets/${id}`),
}

export const entitiesApi = {
  list: (params?: any) => api.get('/entities', { params }),
  get: (id: number) => api.get(`/entities/${id}`),
  create: (data: any) => api.post('/entities', data),
  update: (id: number, data: any) => api.put(`/entities/${id}`, data),
  delete: (id: number) => api.delete(`/entities/${id}`),
  batchDelete: (ids: string[]) => api.post('/entities/batch-delete', { ids }),
  stats: () => api.get('/entities/stats'),
  search: (keyword: string) => api.get('/entities/search', { params: { keyword } }),
  getPublic: (id: number) => api.get(`/entities/${id}/public`),
  // 许可备案
  getLicenses: (entityId: number) => api.get(`/entities/${entityId}/licenses`),
  addLicense: (entityId: number, data: any) => api.post(`/entities/${entityId}/licenses`, data),
  updateLicense: (entityId: number, licenseId: string, data: any) => api.put(`/entities/${entityId}/licenses/${licenseId}`, data),
  removeLicense: (entityId: number, licenseId: string) => api.delete(`/entities/${entityId}/licenses/${licenseId}`),
  // 照片管理
  getPhotos: (entityId: number) => api.get(`/entities/${entityId}/photos`),
  addPhoto: (entityId: number, data: any) => api.post(`/entities/${entityId}/photos`, data),
  addPhotos: (entityId: number, photos: any[]) => api.post(`/entities/${entityId}/photos/batch`, photos),
  removePhoto: (entityId: number, photoId: string) => api.delete(`/entities/${entityId}/photos/${photoId}`),
}

export const qrcodesApi = {
  list: (params?: any) => api.get('/qrcodes', { params }),
  get: (id: string) => api.get(`/qrcodes/${id}`),
  create: (data: any) => api.post('/qrcodes', data),
  update: (id: string, data: any) => api.put(`/qrcodes/${id}`, data),
  delete: (id: string) => api.delete(`/qrcodes/${id}`),
  regenerate: (id: string) => api.post(`/qrcodes/regenerate/${id}`),
  verify: (id: string, data: any) => api.post(`/qrcodes/${id}/verify`, data),
}

export const inspectionTemplatesApi = {
  list: (params?: any) => api.get('/inspection-templates', { params }),
  get: (id: number) => api.get(`/inspection-templates/${id}`),
  create: (data: any) => api.post('/inspection-templates', data),
  update: (id: number, data: any) => api.put(`/inspection-templates/${id}`, data),
  delete: (id: number) => api.delete(`/inspection-templates/${id}`),
}

export const inspectionPlansApi = {
  list: (params?: any) => api.get('/inspection-plans', { params }),
  get: (id: number) => api.get(`/inspection-plans/${id}`),
  create: (data: any) => api.post('/inspection-plans', data),
  update: (id: number, data: any) => api.put(`/inspection-plans/${id}`, data),
  delete: (id: number) => api.delete(`/inspection-plans/${id}`),
  publish: (id: number) => api.post(`/inspection-plans/${id}/publish`),
  cancel: (id: number) => api.post(`/inspection-plans/${id}/cancel`),
}

export const inspectionsApi = {
  list: (params?: any) => api.get('/inspections', { params }),
  get: (id: number) => api.get(`/inspections/${id}`),
  create: (data: any) => api.post('/inspections', data),
  update: (id: number, data: any) => api.put(`/inspections/${id}`, data),
  delete: (id: number) => api.delete(`/inspections/${id}`),
  batchDelete: (ids: string[]) => api.post('/inspections/batch-delete', { ids }),
}

export const screeningPlansApi = {
  list: (params?: any) => api.get('/screening-plans', { params }),
  get: (id: number) => api.get(`/screening-plans/${id}`),
  create: (data: any) => api.post('/screening-plans', data),
  update: (id: number, data: any) => api.put(`/screening-plans/${id}`, data),
  delete: (id: number) => api.delete(`/screening-plans/${id}`),
  publish: (id: number) => api.post(`/screening-plans/${id}/publish`),
  cancel: (id: number) => api.post(`/screening-plans/${id}/cancel`),
}

export const screeningsApi = {
  list: (params?: any) => api.get('/screenings', { params }),
  get: (id: number) => api.get(`/screenings/${id}`),
  create: (data: any) => api.post('/screenings', data),
  update: (id: number, data: any) => api.put(`/screenings/${id}`, data),
  delete: (id: number) => api.delete(`/screenings/${id}`),
  complete: (id: number) => api.put(`/screenings/${id}/complete`),
}

export const complaintsApi = {
  list: (params?: any) => api.get('/complaints', { params }),
  get: (id: number) => api.get(`/complaints/${id}`),
  create: (data: any) => api.post('/complaints', data),
  update: (id: number, data: any) => api.put(`/complaints/${id}`, data),
  delete: (id: number) => api.delete(`/complaints/${id}`),
  batchDelete: (ids: string[]) => api.post('/complaints/batch-delete', { ids }),
  handle: (id: number, data: any) => api.put(`/complaints/${id}/handle`, data),
}

export const activitiesApi = {
  list: (params?: any) => api.get('/activities', { params }),
  get: (id: number) => api.get(`/activities/${id}`),
  create: (data: any) => api.post('/activities', data),
  update: (id: number, data: any) => api.put(`/activities/${id}`, data),
  publish: (id: number) => api.post(`/activities/${id}/publish`),
  delete: (id: number) => api.delete(`/activities/${id}`),
}

export const notificationsApi = {
  list: (params?: any) => api.get('/notifications', { params }),
  get: (id: number) => api.get(`/notifications/${id}`),
  create: (data: any) => api.post('/notifications', data),
  update: (id: number, data: any) => api.put(`/notifications/${id}`, data),
  delete: (id: number) => api.delete(`/notifications/${id}`),
  markRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  batchRead: (ids: string[]) => api.put('/notifications/batch-read', { ids }),
  batchDelete: (ids: string[]) => api.post('/notifications/batch-delete', { ids }),
  stats: () => api.get('/notifications/stats'),
  templates: () => api.get('/notifications/templates'),
}

export const infoCorrectionsApi = {
  list: (params?: any) => api.get('/info-corrections', { params }),
  get: (id: number) => api.get(`/info-corrections/${id}`),
  create: (data: any) => api.post('/info-corrections', data),
  update: (id: number, data: any) => api.put(`/info-corrections/${id}`, data),
  delete: (id: number) => api.delete(`/info-corrections/${id}`),
  review: (id: number, data: any) => api.put(`/info-corrections/${id}/review`, data),
}

export const selfInspectionsApi = {
  list: (params?: any) => api.get('/self-inspections', { params }),
  get: (id: number) => api.get(`/self-inspections/${id}`),
  create: (data: any) => api.post('/self-inspections', data),
  update: (id: number, data: any) => api.put(`/self-inspections/${id}`, data),
  delete: (id: number) => api.delete(`/self-inspections/${id}`),
  submit: (id: number) => api.put(`/self-inspections/${id}/submit`),
}

export const feedbackApi = {
  list: (params?: any) => api.get('/feedback', { params }),
  get: (id: number) => api.get(`/feedback/${id}`),
  create: (data: any) => api.post('/feedback', data),
  update: (id: number, data: any) => api.put(`/feedback/${id}`, data),
  delete: (id: number) => api.delete(`/feedback/${id}`),
  reply: (id: number, reply: string) => api.put(`/feedback/${id}/reply`, { reply }),
}

export const reportsApi = {
  dashboard: () => api.get('/reports/dashboard'),
  inspections: (params?: any) => api.get('/reports/inspections', { params }),
  complaints: (params?: any) => api.get('/reports/complaints', { params }),
  entities: (params?: any) => api.get('/reports/entities', { params }),
}

export const rectificationsApi = {
  list: (params?: any) => api.get('/rectifications', { params }),
  get: (id: string) => api.get(`/rectifications/${id}`),
  create: (data: any) => api.post('/rectifications', data),
  submit: (id: string, data: any) => api.post(`/rectifications/${id}/submit`, data),
  review: (id: string, data: any) => api.post(`/rectifications/${id}/review`, data),
  delete: (id: string) => api.delete(`/rectifications/${id}`),
  batchDelete: (ids: string[]) => api.post('/rectifications/batch-delete', { ids }),
  batchReview: (ids: string[], result: string, remark?: string) => api.post('/rectifications/batch-review', { ids, result, remark }),
}

export const qrScansApi = {
  scan: (data: any) => api.post('/qr-scans/scan', data),
  list: (params?: any) => api.get('/qr-scans', { params }),
  get: (id: string) => api.get(`/qr-scans/${id}`),
  stats: (params?: any) => api.get('/qr-scans/stats', { params }),
}

export const auditLogsApi = {
  list: (params?: any) => api.get('/audit-logs', { params }),
  get: (id: string) => api.get(`/audit-logs/${id}`),
  stats: () => api.get('/audit-logs/stats'),
}

export const exportsApi = {
  download: (type: string, params?: Record<string, string>) => {
    const token = localStorage.getItem('token')
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    const url = `${API_BASE_URL}/exports/${type}${query}`
    const a = document.createElement('a')
    a.href = url
    // Use fetch to get blob with auth header
    return fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const objectUrl = URL.createObjectURL(blob)
        a.href = objectUrl
        a.download = `${type}_${new Date().toISOString().slice(0,10)}.xlsx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(objectUrl)
      })
  },
}
