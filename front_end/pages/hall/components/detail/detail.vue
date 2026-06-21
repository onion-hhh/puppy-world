<template>
  <view class="detail">
    <!-- 头部 -->
    <view class="header">
      <view class="back-btn" @tap="goBack">返回</view>
      <view class="title">地点详情</view>
    </view>

    <!-- 主内容卡片 -->
    <view class="content">
      <view class="card">
        <!-- 地点名称和评分 -->
        <view class="name-row">
          <view class="name">{{detail.name}}</view>
          <view class="score">
            <text class="score-text">{{detail.avgScore}}</text>
            <u-rate :value="detail.avgScore" size="30" activeColor="#5094f1" allowHalf readonly></u-rate>
          </view>
        </view>

        <!-- 地址 -->
        <view class="info-item" @tap="openAddress">
          <text class="label">📍 地址</text>
          <text class="value" style="color: #2c9dff;">{{detail.address}} ➤</text>
        </view>

        <!-- 营业时间 -->
        <view class="info-item">
          <text class="label">🕐 营业时间</text>
          <text class="value">{{detail.businessHours || '暂无'}}</text>
        </view>

        <!-- 联系电话 -->
        <view class="info-item">
          <text class="label">📞 联系电话</text>
          <text class="value">{{detail.phone || '暂无'}}</text>
        </view>

        <!-- 标签/设施 -->
        <view class="tags-wrap">
          <text class="label">🏷️ 设施标签</text>
          <view class="tags">
            <text class="tag" v-for="(tag, idx) in tagList" :key="idx">{{tag}}</text>
          </view>
        </view>

        <!-- 规则说明 -->
        <view class="rules-wrap">
          <text class="label">⚠️ 注意事项</text>
          <view class="rules-text">{{detail.rules || '暂无'}}</view>
        </view>

        <!-- 底部操作栏 -->
        <view class="action-bar">
          <!-- 收藏按钮 -->
          <view class="action-btn" @tap="toggleCollect">
            <text class="icon-text">{{ isCollected ? '❤️' : '🤍' }}</text>
            <text class="label" :class="{active: isCollected}">
              {{ detail.collectCount || 0 }}
            </text>
          </view>

          <!-- 评论按钮：点击打开评论弹窗 -->
          <view class="action-btn" @tap="openCommentPopup">
            <text class="icon-text">💬</text>
            <text class="label">{{ detail.commentCount || 0 }}</text>
          </view>
        </view>
      </view>

      <!-- 评论区 -->
      <view class="comment-section" id="commentSection">
        <view class="section-title">用户评论</view>
        <view class="comment-item" v-for="comment in commentList" :key="comment.id">
          <view class="comment-header">
            <view class="user-info">
              <u-avatar :text="comment.userName ? comment.userName.charAt(0) : '用'" fontSize="18" randomBgColor></u-avatar>
              <view class="user-name">{{comment.userName || '匿名用户'}}</view>
            </view>
            <view class="comment-time">{{formatDate(comment.createTime)}}</view>
          </view>
          <view class="comment-content">{{comment.content}}</view>
          <u-rate :value="comment.score" size="30" activeColor="#5094f1" allowHalf readonly></u-rate>
        </view>
        <view class="empty-tip" v-if="commentList.length === 0">暂无评论，快来抢沙发吧~</view>
      </view>
    </view>

    <!-- 评论弹窗（底部弹出） -->
    <view v-if="showCommentPopup" class="comment-popup-mask" @tap="closeCommentPopup">
      <view class="comment-popup" @tap.stop>
        <view class="popup-title">发表评论</view>

        <!-- 星级评分 -->
        <view class="rate-wrap">
          <text class="rate-label">我的评分：</text>
          <u-rate v-model="newComment.score" size="35" activeColor="#5094f1" allowHalf></u-rate>
        </view>

        <!-- 评论输入框 -->
        <textarea
          v-model="newComment.content"
          class="comment-textarea"
          placeholder="说说你的体验..."
          maxlength="200"
        ></textarea>

        <!-- 发布按钮 -->
        <view class="publish-btn" @tap="submitComment">发布评论</view>
      </view>
    </view>
  </view>
</template>

<script>
import { get, post } from '@/utils/request.js'
export default {
  data() {
    return {
      id: null,
      userId: uni.getStorageSync('userId') || '',
      isCollected: false,
      detail: {},
      tagList: [],
      commentList: [],

      // 评论弹窗
      showCommentPopup: false,
      newComment: {
        content: '',
        score: 5
      }
    }
  },
  onLoad(options) {
    this.id = options.id
    this.getDetail()
    this.getComments()
    this.checkCollectStatus()
  },
  methods: {
    async getDetail() {
      try {
        const res = await get('/place/detail', { id: this.id })
        if (res.code === 200) {
          this.detail = {
            ...res.data,
            avgScore: Number(res.data.avgScore) || 0
          }
          if (this.detail.tags) {
            this.tagList = this.detail.tags.split(',')
          }
        }
      } catch (err) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    async getComments() {
      try {
        const res = await get('/comment/list', { placeId: this.id })
        if (res.code === 200) {
          this.commentList = res.data || []
        }
      } catch (err) {
        console.log('评论加载失败', err)
      }
    },
	openAddress(){
		uni.openLocation({
			latitude: Number(this.detail.latitude),  // 转成数字类型
			longitude: Number(this.detail.longitude),
			name: this.detail.name,                 // 地图上显示的地点名称
			address: this.detail.address,           // 详细地址
			scale: 18,
			success: () => {
			  console.log('地图打开成功')
			},
			fail: (err) => {
			  uni.showToast({ title: '打开地图失败', icon: 'none' })
			  console.error(err)
			}
		})
	},
    async checkCollectStatus() {
      if (!this.userId) return
      try {
        const res = await get('/collect/check', {
          userId: this.userId,
          placeId: this.id
        })
        this.isCollected = res.data.isCollected
      } catch (e) {}
    },
    async toggleCollect() {
      if (!this.userId) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        return
      }
      try {
        const res = await post('/collect/toggle', {
          userId: this.userId,
          placeId: this.id
        })
        this.isCollected = !this.isCollected
        this.detail.collectCount += this.isCollected ? 1 : -1
        uni.showToast({
          title: this.isCollected ? '收藏成功' : '已取消收藏',
          icon: 'none'
        })
      } catch (e) {
        uni.showToast({ title: '操作失败', icon: 'none' })
      }
    },

    // 打开评论弹窗
    openCommentPopup() {
      if (!this.userId) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        return
      }
      this.showCommentPopup = true
    },
    // 关闭弹窗
    closeCommentPopup() {
      this.showCommentPopup = false
      // 清空内容，评分重置为5
      this.newComment.content = ''
      this.newComment.score = 5
    },

    // 提交评论
    async submitComment() {
      if (!this.newComment.content.trim()) {
        uni.showToast({ title: '请输入评论内容', icon: 'none' })
        return
      }
      try {
        const res = await post('/comment/add', {
          userId: this.userId,
          placeId: this.id,
          content: this.newComment.content,
          score: this.newComment.score
        })
        if (res.code === 200) {
          uni.showToast({ title: '评论成功', icon: 'success' })
          // 刷新评论列表
          this.getComments()
          // 评论数+1
          this.detail.commentCount = (this.detail.commentCount || 0) + 1
          // 关闭弹窗
          this.closeCommentPopup()
          // 滚动到评论区
          uni.nextTick(() => {
            uni.pageScrollTo({
              selector: '#commentSection',
              duration: 300
            })
          })
        }
      } catch (e) {
        uni.showToast({ title: '评论失败', icon: 'none' })
      }
    },

    formatDate(timeStr) {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      const y = date.getFullYear()
      const m = (date.getMonth() + 1).toString().padStart(2, '0')
      const d = date.getDate().toString().padStart(2, '0')
      return `${y}-${m}-${d}`
    },
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.detail {
  background: #93c3f5;
  min-height: 100vh;
}

.header {
  background: #5094f1;
  color: #fff;
  padding: 30rpx;
  display: flex;
  align-items: center;
}
.back-btn {
  font-size: 28rpx;
  margin-right: 20rpx;
}
.title {
  font-size: 32rpx;
  font-weight: bold;
  margin-left: 207rpx;
}

.content {
  padding: 20rpx;
}
.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
}

.name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.name {
  font-size: 36rpx;
  font-weight: bold;
}
.score-text {
  font-size: 30rpx;
  color: #333;
  margin-right: 10rpx;
}
.score {
  display: flex;
  align-items: center;
}

.info-item {
  margin-bottom: 20rpx;
}
.label {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}
.value {
  font-size: 28rpx;
  color: #333;
}

.tags-wrap {
  margin: 25rpx 0;
}
.tags {
  display: flex;
  flex-wrap: wrap;
}
.tag {
  background: #5094f1;
  color: #fff;
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 30rpx;
  margin-right: 10rpx;
  margin-bottom: 10rpx;
}

.rules-wrap {
  margin-bottom: 25rpx;
}
.rules-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.action-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #fff;
  padding: 20rpx 0;
  border-top: 1rpx solid #eee;
  margin-top: 30rpx;
}
.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.icon-text {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}
.label {
  font-size: 24rpx;
  color: #666;
}
.label.active {
  color: #ff4444;
}

.comment-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-top: 30rpx;
}
.section-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}
.comment-item {
  border-bottom: 1rpx solid #eee;
  padding: 20rpx 0;
}
.comment-item:last-child {
  border-bottom: none;
}
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}
.user-info {
  display: flex;
  align-items: center;
}
.user-name {
  font-size: 26rpx;
  color: #333;
  margin-left: 15rpx;
}
.comment-time {
  font-size: 22rpx;
  color: #999;
}
.comment-content {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 10rpx;
}
.empty-tip {
  text-align: center;
  font-size: 26rpx;
  color: #999;
  padding: 30rpx 0;
}

/* 评论弹窗 */
.comment-popup-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}
.comment-popup {
  width: 100%;
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;
  padding: 30rpx;
  box-sizing: border-box;
}
.popup-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}
.rate-wrap {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}
.rate-label {
  font-size: 28rpx;
  margin-right: 20rpx;
}
.comment-textarea {
  width: 100%;
  height: 200rpx;
  border: 1rpx solid #eee;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 26rpx;
  box-sizing: border-box;
  margin-bottom: 20rpx;
}
.publish-btn {
  width: 100%;
  background: linear-gradient(90deg, #5094f1, #74b0f7);
  color: #fff;
  text-align: center;
  font-size: 32rpx;
  padding: 24rpx 0;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(80, 148, 241, 0.3);
  font-weight: 500;
}
</style>