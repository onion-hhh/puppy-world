// utils/request.js
const baseUrl = 'http://localhost:3000/api'

export function request(options) {
  // 获取 token
  const token = uni.getStorageSync('token')
  
  // 设置默认配置
  options.url = baseUrl + options.url
  options.header = options.header || {}
  
  // 如果有 token，添加到请求头
  if (token) {
    options.header.Authorization = `Bearer ${token}`
  }
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      success: (res) => {
        // 处理 token 过期
        if (res.data.code === 401) {
          uni.removeStorageSync('token')
          uni.removeStorageSync('userInfo')
          uni.navigateTo({ url: '/pages/login/login' })
          reject(new Error('登录已过期'))
          return
        }
        resolve(res.data)
      },
      fail: (err) => {
        uni.showToast({ title: '网络请求失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

// 快捷方法
export function get(url, data = {}) {
  return request({ url, method: 'GET', data })
}

export function post(url, data = {}) {
  return request({ url, method: 'POST', data })
}