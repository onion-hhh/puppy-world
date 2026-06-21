import request from './request'

export const adminApi = {
  login(username, password) {
    return request.post('/admin/login', { username, password })
  },
  
  getStatistics() {
    return request.get('/admin/statistics')
  },
  
  getApplyList() {
    return request.get('/apply/admin/list')
  },
  
  auditApply(data) {
    return request.post('/apply/admin/audit', data)
  },
  
  getPlaceList() {
    return request.get('/admin/place/list')
  },
  
  deletePlace(id) {
    return request.post('/admin/place/delete', { placeId: id })
  },
  
  getUserList() {
    return request.get('/admin/user/list')
  },
  
  getCommentList() {
    return request.get('/admin/comment/list')
  },
  
  deleteComment(id) {
    return request.post('/admin/comment/delete', { commentId: id })
  },
  
  getAuditLogs(hours = 24) {
    return request.get('/audit/logs', { params: { hours } })
  }
}
