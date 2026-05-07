<template>
  <view class="publish-page">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="back-btn" @tap="goBack">返回</view>
      <view class="title">我的发布</view>
    </view>

    <!-- 发布列表 -->
    <scroll-view 
      class="list-container"
      scroll-y
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <view class="empty-tip" v-if="list.length === 0 && !loading">
        你还没有发布任何内容~
      </view>

      <view class="publish-item" v-for="item in list" :key="item.id">
        <view class="item-content">
          <image 
            class="item-img" 
            :src="fixImageUrl(item.images)" 
            mode="aspectFill"
          />
          <view class="item-info">
            <view class="item-title">{{ item.name }}</view>
            <view class="item-address">{{ item.address }}</view>
            <view class="item-tags">{{ item.tags }}</view>
            <view class="item-time">{{ formatTime(item.create_time) }}</view>
          </view>
        </view>
		</view>
      <view class="loading-tip" v-if="loading">加载中...</view>
      <view class="no-more-tip" v-if="noMore">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script>
import { mapState } from 'vuex'
import { get } from '@/utils/request.js';
export default {
  data() {
    return {
      list: [],
      loading: false
    };
  },
  onShow() {
    this.getList()
  },
  computed:{
    ...mapState(['userId'])
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },

    formatTime(timeStr) {
      if (!timeStr) return '';
      const date = new Date(timeStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    async getList() {
      if (this.loading) return;
      this.loading = true;

      try {
        const res = await get('/apply/list', {
          userId: this.userId
        });

        if(res.code === 200){
          this.list = res.data || [];
		  console.log(res);
        } else {
          uni.showToast({ title: res.message || '加载失败', icon: 'none' });
        }
      } catch (error) {
        console.error('获取列表失败:', error);
        uni.showToast({ title: '网络异常', icon: 'none' });
      } finally {
        this.loading = false;
      }
    },
	// 修复2：处理图片URL，HTTP转HTTPS，空值用默认图兜底
	    fixImageUrl(url) {
	      if (!url) {
	        return '/static/logo.png'; // 无图时用默认图
	      }
	      // 开发环境：HTTP 转 HTTPS（仅本地调试用）
	      if (url.startsWith('http://')) {
	        // 方案1：本地调试时，直接用默认图替代HTTP地址
	        return '/static/logo.png';
	        // 方案2：如果你的后端支持HTTPS，可改成：
	        // return url.replace('http://', 'https://');
	      }
	      return url;
	    }
  }
};
</script>

<style scoped>
.publish-page {
  background-color: #f5f7fa;
  min-height: 100vh;
}
.navbar {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 90rpx;
  background: linear-gradient(135deg, #409eff 0%, #ffc107 100%);
  position: relative;
}
.back-btn {
  position: absolute;
  left: 20rpx;
  color: #fff;
  font-size: 32rpx;
}
.title {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
}
.list-container {
  padding: 20rpx 30rpx;
  height: calc(100vh - 90rpx);
}
.empty-tip {
  text-align: center;
  color: #999;
  font-size: 28rpx;
  margin-top: 100rpx;
}
.publish-item {
  background: #fff;
  width: 84%;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}
.item-content {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}
.item-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}
.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.item-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
.item-address {
  font-size: 28rpx;
  color: #666;
}
.item-tags {
  font-size: 24rpx;
  color: #409eff;
}
.item-time {
  font-size: 24rpx;
  color: #999;
}
.item-actions {
  display: flex;
  justify-content: flex-end;
}
.btn {
  padding: 12rpx 70rpx;
  margin: 0 20rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
}
.delete-btn {
  background: #ffebee;
  color: #f56c6c;
}
.loading-tip,
.no-more-tip {
  text-align: center;
  font-size: 26rpx;
  color: #999;
  padding: 30rpx;
}
</style>