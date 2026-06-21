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
          <view class="item-info">
            <view class="item-header">
              <view class="item-title">{{ item.name }}</view>
              <view 
                class="status-tag" 
                :class="'status-' + item.status"
                @tap="showRejectReason(item)"
              >
                {{ getStatusText(item.status) }}
              </view>
            </view>
            <view class="item-address">{{ item.address }}</view>
            <view class="item-tags" v-if="item.tags && item.tags !== 'null'">{{ item.tags }}</view>
            <view class="item-time">{{ formatTime(item.create_time) }}</view>
          </view>
        </view>
        <view class="item-actions">
          <view class="delete-btn" @tap="deleteApply(item.id)">删除</view>
        </view>
      </view>
      <view class="loading-tip" v-if="loading">加载中...</view>
      <view class="no-more-tip" v-if="noMore">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script>
import { mapState } from 'vuex'
import { get, post } from '@/utils/request.js';
export default {
  data() {
    return {
      list: [],
      loading: false,
      isRefreshing: false,
      noMore: false
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

    onRefresh() {
      this.isRefreshing = true;
      this.noMore = false;
      this.getList();
    },

    onLoadMore() {
      if (this.loading || this.noMore) return;
    },

    formatTime(timeStr) {
      if (!timeStr) return '';
      const date = new Date(timeStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    getStatusText(status) {
      const statusMap = {
        0: '待审核',
        1: '审核成功',
        2: '审核失败'
      };
      return statusMap[status] || '未知';
    },

    // 显示审核失败原因
    showRejectReason(item) {
      if (item.status === 2) {
        uni.showModal({
          title: '审核失败原因',
          content: item.rejectReason || item.reject_reason || '暂无原因',
          showCancel: false,
          confirmText: '知道了'
        });
      }
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

    // 删除申请
    async deleteApply(id) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条发布吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await post('/apply/delete', { applyId: id });
              if (result.code === 200) {
                uni.showToast({ title: '删除成功', icon: 'success' });
                this.getList();
              } else {
                uni.showToast({ title: result.message || '删除失败', icon: 'none' });
              }
            } catch (error) {
              uni.showToast({ title: '删除失败', icon: 'none' });
            }
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.publish-page {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding-top: 90rpx;
}
.navbar {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 90rpx;
  background: linear-gradient(135deg, #409eff 0%, #ffc107 100%);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
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
  box-sizing: border-box;
}
.empty-tip {
  text-align: center;
  color: #999;
  font-size: 28rpx;
  margin-top: 100rpx;
}
.publish-item {
  background: #fff;
  width: 90%;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}
.item-content {
  margin-bottom: 20rpx;
}
.item-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.item-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
.status-tag {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
}
.status-0 {
  background: #fff3e0;
  color: #ff9800;
}
.status-1 {
  background: #e8f5e9;
  color: #4caf50;
}
.status-2 {
  background: #ffebee;
  color: #f56c6c;
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
.delete-btn {
  background: #ffebee;
  color: #f56c6c;
  padding: 12rpx 30rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
}
</style>