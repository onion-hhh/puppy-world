<template>
  <view class="mine-page">
    <!-- 顶部蓝黄背景 -->
    <view class="top-banner">
      <view class="user-info">
        <!-- 头像容器 + 头像，解决空隙问题 -->
        <view class="avatar-wrap">
          <image 
            class="avatar" 
            :src="userAvatar || '/static/images/default-avatar.png'"
            mode="aspectFill"
          />
        </view>
        <!-- 昵称 -->
        <view class="nickname">{{ userNickname || '游客' }}</view>
      </view>
    </view>

    <!-- 功能模块 -->
    <view class="menu-list">
      <!-- 我的收藏 -->
      <view class="menu-item" @tap="goCollect">
        <view class="menu-icon">⭐</view>
        <view class="menu-title">我的收藏</view>
        <view class="arrow">></view>
      </view>

      <!-- 我的发布 -->
      <view class="menu-item" @tap="goPublish">
        <view class="menu-icon">📝</view>
        <view class="menu-title">我的发布</view>
        <view class="arrow">></view>
      </view>

      <!-- 设置 -->
      <view class="menu-item" @tap="goSetting">
        <view class="menu-icon">⚙️</view>
        <view class="menu-title">设置</view>
        <view class="arrow">></view>
      </view>

      <!-- 智能助手 -->
      <view class="menu-item" @tap="goChat">
        <view class="menu-icon">🤖</view>
        <view class="menu-title">智能助手</view>
        <view class="arrow">></view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-btn" @tap="logout">
      退出登录
    </view>
  </view>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      
    };
  },
  computed: {
      // 直接映射Vuex里的getters
      ...mapGetters(['userAvatar', 'userNickname', 'isLogin'])
    },
  onShow() {
    // 页面显示时可获取用户信息
	const storedInfo = uni.getStorageSync('userInfo')
	if(storedInfo){
		this.userInfo=storedInfo
	}
  },
  methods: {
    goCollect() {
      uni.navigateTo({
        url: "/pages/my/collect/collect"
      });
    },
    goPublish() {
      uni.navigateTo({
        url: "/pages/my/publish/publish"
      });
    },
    goSetting() {
      uni.navigateTo({
        url: "/pages/my/setting/setting"
      });
    },
    goChat() {
      uni.navigateTo({
        url: "/pages/chat/chat"
      });
    },
    logout() {
      uni.showModal({
        title: "提示",
        content: "确定退出登录？",
        success: (res) => {
          if (res.confirm) {
            uni.clearStorageSync();
            uni.reLaunch({ url: "/pages/index/index" });
          }
        }
      });
    }
  }
};
</script>

<style scoped>
/* 整体页面 */
.mine-page {
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 顶部蓝黄渐变横幅 */
.top-banner {
  background: linear-gradient(135deg, #409eff 0%, #ffc107 100%);
  padding: 60rpx 30rpx 80rpx;
  border-radius: 0 0 50rpx 50rpx;
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20rpx;
}

/* 头像容器：解决边框与图片之间的空隙 */
.avatar-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid #fff;
  overflow: hidden; /* 关键：裁剪超出部分，消除留白 */
  background-color: #fff; /* 兜底背景，避免透明图露出渐变底色 */
}

.avatar {
  width: 100%;
  height: 100%;
  display: block; /* 消除 image 标签自带的默认间隙 */
}

.nickname {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

/* 菜单列表 */
.menu-list {
  background: #fff9dd;
  margin: -40rpx 30rpx 40rpx;
  border-radius: 24rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 24rpx;
}

.menu-title {
  flex: 1;
  font-size: 32rpx;
  color: #333;
}

.arrow {
  font-size: 28rpx;
  color: #999;
}

/* 退出按钮 */
.logout-btn {
  background: #409eff;
  color: #fff;
  text-align: center;
  margin: 40rpx 30rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  font-size: 32rpx;
}
</style>