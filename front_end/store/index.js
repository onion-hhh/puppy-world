import Vue from 'vue'
import Vuex from 'vuex'
import { get, post } from '@/utils/request.js'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // ======================
    // 1. 用户信息（和你本地存储完全对应）
    // ======================
    userInfo: uni.getStorageSync('userInfo') || {},
    userId: uni.getStorageSync('userId') || null,
    token: uni.getStorageSync('token') || '',

    // ======================
    // 2. 收藏列表（全局）
    // ======================
    collectList: [], // 存 collects 数组（只包含 placeId）
    collectPlaces: [] // 存 places 数组（包含完整地点信息）
  },

  mutations: {
    // ==================================
    // 核心：一次性设置登录态（token + userInfo + userId）
    // ==================================
    SET_LOGIN_DATA(state, { token, userInfo, userId }) {
      state.token = token
      state.userInfo = userInfo
      state.userId = userId

      // 同步到本地存储
      uni.setStorageSync('token', token)
      uni.setStorageSync('userInfo', userInfo)
      uni.setStorageSync('userId', userId)
    },

    // 更新用户信息（修改头像/昵称时用）
    SET_USER_INFO(state, userInfo) {
      state.userInfo = { ...state.userInfo, ...userInfo }
      uni.setStorageSync('userInfo', state.userInfo)
    },

    // 清空登录态（退出登录）
    CLEAR_LOGIN_DATA(state) {
      state.token = ''
      state.userInfo = {}
      state.userId = null
      state.collectList = []
	  state.collectPlaces = []

      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
      uni.removeStorageSync('userId')
    },

    // ==================================
    // 收藏相关：更新收藏列表
    // ==================================
	SET_COLLECT_LIST(state, { collects, places }) {
	    state.collectList = collects // 用于判断是否收藏
	    state.collectPlaces = places // 用于收藏页展示列表
	  },
	
	  CLEAR_COLLECT(state) {
	    state.collectList = []
	    state.collectPlaces = []
	  }
  },

  actions: {
    // ==================================
    // 登录成功时调用，一次性设置所有状态
    // ==================================
    login({ commit, dispatch }, { token, userInfo, userId }) {
      commit('SET_LOGIN_DATA', { token, userInfo, userId })
      // 登录后自动拉取收藏列表
      dispatch('getCollectList')
    },

    // 退出登录，清空所有状态
    logout({ commit }) {
      commit('CLEAR_LOGIN_DATA')
    },

    // 异步获取收藏列表（全局调用）
    async getCollectList({ commit, state }) {
      if (!state.userId) return
      try {
        const res = await get('/collect/list', { userId: state.userId })
        console.log('收藏列表', res)
    
        // ✅ 安全判断，防止报错
        if (!res || !res.data || res.code !== 200) {
          return
        }
        const { collects, places } = res.data
    
        commit('SET_COLLECT_LIST', {
          collects: collects || [],
          places: places || []
        })
    
      } catch (err) {
        console.error('获取收藏失败', err)
      }
    },
	// 收藏 / 取消收藏
	async toggleCollect({ commit, dispatch }, { userId, placeId }) {
	  if (!userId || !placeId) return
	
	  try {
	    // 调用后端接口
	    const res = await post('/collect/toggle', {
	      userId: userId,
	      placeId: placeId
	    })
	
	    if (res.code === 200) {
	      // 切换成功后，重新拉取最新收藏列表（全局同步）
	      dispatch('getCollectList')
	    }
	  } catch (err) {
	    console.error('收藏操作失败', err)
	  }
	}
  },

  getters: {
    // 判断是否登录
    isLogin: (state) => !!state.userId,

    // 直接获取用户头像、昵称（全局用）
    userAvatar: state => state.userInfo.avatar || '',
    userNickname: state => state.userInfo.nickname || '',

    // 根据地点ID 判断是否收藏（全局用）
    isCollected: (state) => (placeId) => {
        // 从 collectList 里找有没有匹配的 placeId
        return state.collectList.some(item => item.placeId === placeId)
      }
  }
})