<template>
  <view class="collect-page">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="back-btn" @tap="goBack">返回</view>
      <view class="title">我的收藏</view>
    </view>

    <!-- 收藏列表 -->
    <view class="collect-list" v-if="collectPlaces.length">
      <view class="collect-item" v-for="item in collectPlaces" :key="item.id" @tap="goDetail(item)">
        <image class="cover" :src="item.images || '/static/logo.png'" mode="aspectFill"></image>
        <view class="info">
          <view class="name">{{ item.name }}</view>
          <view class="address">{{ item.address }}</view>
          <view class="type-tag" :style="{background: getTypeColor(item.type)}">
            {{ getTypeName(item.type) }}
          </view>
        </view>
        <!-- 取消收藏按钮：用黄色星星，样式和设计图一致 -->
        <view class="star-btn" @tap.stop="handleCancelCollect(item)">
          ⭐
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-tip" v-else>
      <image class="empty-img" src="/static/empty-collect.png" mode="aspectFill"></image>
      <view class="text">暂无收藏，去首页看看吧~</view>
      <button class="go-btn" @tap="goHome">去逛逛</button>
    </view>
  </view>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  onShow() {
    this.getCollectList()
  },
  computed: {
    ...mapState(['collectPlaces', 'userId'])
  },
  methods: {
    // 只映射 Vuex 里的收藏方法，不冲突
    ...mapActions(['toggleCollect', 'getCollectList']),

    getTypeName(type) {
      const map = { 1: '公园', 2: '店铺', 3: '医院' }
      return map[type] || '未知'
    },
    getTypeColor(type) {
      const map = { 1: '#409eff', 2: '#ffc107', 3: '#ff7875' }
      return map[type] || '#999'
    },

    // 重命名本地方法，避免冲突
    async handleCancelCollect(item) {
      uni.showModal({
        title: '提示',
        content: '确定取消收藏该地点？',
        success: async (res) => {
          if (res.confirm) {
            try {
              // 调用 Vuex 里的 toggleCollect 方法
              await this.toggleCollect({
                userId: this.userId,
                placeId: item.id
              })
              uni.showToast({ title: '已取消收藏', icon: 'success' })
              this.getCollectList() // 刷新列表
            } catch (err) {
              uni.showToast({ title: '操作失败，请重试', icon: 'none' })
              console.error('取消收藏失败：', err)
            }
          }
        }
      })
    },

    goDetail(item) {
      uni.navigateTo({
        url: `/pages/detail/detail?id=${item.id}`
      })
    },
    goBack() {
      uni.navigateBack()
    },
    goHome() {
      uni.switchTab({ url: '/pages/index/index' })
    }
  }
}
</script>

<style scoped>
.collect-page {
  background: #f5f7fa;
  min-height: 100vh;
}

/* 顶部导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  background: linear-gradient(90deg, #409eff 0%, #ffc107 100%);
  color: #fff;
  height: 88rpx;
  padding: 0 30rpx;
}
.back-btn {
  font-size: 32rpx;
  width: 65rpx;
}
.title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: bold;
  margin-right: 65rpx;
}

/* 收藏列表 */
.collect-list {
  padding: 20rpx 30rpx;
}
.collect-item {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
}
.cover {
  width: 160rpx;
  height: 120rpx;
  border-radius: 12rpx;
  background: #eee;
}
.info {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}
.address {
  font-size: 24rpx;
  color: #666;
  margin-top: 10rpx;
}
.type-tag {
  align-self: flex-start;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #fff;
  margin-top: 10rpx;
}
/* 星星按钮：黄色，和设计图一致，点击反馈更明显 */
.star-btn {
  align-self: center;
  font-size: 40rpx;
  margin-left: 20rpx;
  color: #ffc107;
  cursor: pointer;
}

/* 空状态 */
.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 150rpx;
}
.empty-img {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
}
.text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 30rpx;
}
.go-btn {
  background: #409eff;
  color: #fff;
  padding: 16rpx 40rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
}
</style>