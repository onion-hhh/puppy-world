<template>
  <view class="settings">
    <view class="header">
      <view class="back" @tap="goBack">返回</view>
      <view class="title">个人设置</view>
    </view>

    <view class="item" @tap="changeAvatar">
      <text class="label">头像</text>
      <view class="item-right">
        <image class="avatar" :src="form.avatar" mode="aspectFill"></image>
        <text class="arrow">></text>
      </view>
    </view>

    <view class="item" @tap="editNickname">
      <text class="label">昵称</text>
      <view class="item-right">
        <text class="value">{{ form.nickname }}</text>
        <text class="arrow">></text>
      </view>
    </view>

    <button class="save-btn" @tap="save">保存修改</button>
  </view>
</template>

<script>
import { mapState } from 'vuex'
import { post } from '@/utils/request.js'

export default {
  data() {
    return {
      form: {
        nickname: '',
        avatar: ''
      }
    }
  },

  computed: {
    ...mapState(['userInfo'])
  },

  onLoad() {
    this.form.nickname = this.userInfo.nickname
    this.form.avatar = this.userInfo.avatar
  },

  methods: {
    goBack() {
      uni.navigateBack()
    },

    changeAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const path = res.tempFilePaths[0]
          this.form.avatar = path
        }
      })
    },

    editNickname() {
      uni.showModal({
        title: '修改昵称',
        editable: true,
        placeholderText: '请输入新昵称',
        success: (res) => {
          if (res.confirm && res.content.trim()) {
            this.form.nickname = res.content.trim()
          }
        }
      })
    },

    async save() {
      const userId = this.$store.state.userId
      if (!userId) return

      const newUserInfo = {
        ...this.userInfo,
        nickname: this.form.nickname,
        avatar: this.form.avatar
      }

      this.$store.commit('SET_USER_INFO', newUserInfo)

      try {
        const res = await post('/user/update', {
          userId: userId,
          nickname: this.form.nickname,
          avatar: this.form.avatar
        })
		console.log(res);
        if (res.code === 200) {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 800)
        }
      } catch (err) {
		console.error('请求失败:', err);
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style scoped>
.settings {
  background: #f5f7fa;
  min-height: 100vh;
}

.header {
  background: #409eff;
  color: #fff;
  padding: 30rpx;
  display: flex;
  align-items: center;
}

.back {
  font-size: 32rpx;
  width: 65rpx;
}

.title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  margin-right: 65rpx;
}

.item {
  background: #fff;
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
}

.label {
  font-size: 32rpx;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.avatar {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
}

.value {
  font-size: 30rpx;
  color: #666;
}

.arrow {
  color: #999;
  font-size: 30rpx;
}

.save-btn {
  background: #409eff;
  color: #fff;
  border: none;
  margin: 50rpx 30rpx;
  padding: 25rpx 0;
  border-radius: 12rpx;
  font-size: 32rpx;
}
</style>