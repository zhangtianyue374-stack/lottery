import api from './index'

// 认证接口
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  adminLogin: (data) => api.post('/auth/admin/login', data),
  adminLogout: () => api.post('/auth/admin/logout')
}

// 订单接口
export const orderAPI = {
  bindOrders: (orderNos) => api.post('/orders/bind', { orderNos }),
  getMyOrders: () => api.get('/orders/my')
}

// 抽奖接口
export const lotteryAPI = {
  getInfo: () => api.get('/lottery/info'),
  getPoolRankings: () => api.get('/lottery/pool'),
  getWinners: () => api.get('/lottery/winners'),
  getMyRecords: () => api.get('/lottery/records')
}

// 管理后台接口
export const adminAPI = {
  uploadOrders: (formData) => api.post('/admin/upload-orders', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  generatePool: () => api.post('/admin/generate-pool'),
  drawGrandPrize: (data) => api.post('/admin/draw-grand', data),
  getUsers: (params) => api.get('/admin/users', { params }),
  getStatistics: () => api.get('/admin/statistics'),
  exportWinners: () => api.get('/admin/export', { responseType: 'blob' })
}
