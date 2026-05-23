<template>
	<view class="login-container">
		<view class="title">汪汪世界</view>
		<view class="subtitle">发现身边的宠物友好地点</view>
		<img src="@/static/小狗.png" alt="" />
		<button class="login-btn" @tap="wxLogin">
			微信一键登录
		</button>
	</view>
</template>

<script>
import { post } from '@/utils/request.js'
export default {
	data() {
		return {
			userInfo: null
		}
	},
	methods: {
		async wxLogin() {
			try {
				// 1. 获取用户头像昵称（必须点击触发）
				const userRes = await uni.getUserProfile({
					desc: "用于完善用户资料"
				})
				const { nickName, avatarUrl } = userRes.userInfo

				// 2. 显示加载
				uni.showLoading({ title: "登录中..." })

				// 3. 获取 code
				const loginRes = await uni.login({
					provider: "weixin"
				})
				const code = loginRes.code

				// 4. 用封装好的 request 发送请求 
				const res = await post('/user/login', {
					code,
					nickname: nickName, // 后端字段是 nickname
					avatar: avatarUrl   // 后端字段是 avatar
				})

				// 5. 登录成功逻辑（你之前漏了！）
				if (res.code === 200) {
					// 关键：调用Vuex的action，一次性存进去
					this.$store.dispatch('login', {
					  token: res.data.token,
					  userInfo: res.data.user,
					  userId: res.data.user.id
					})
					// 跳转到 tabBar 大厅
					uni.switchTab({
						url: "/pages/hall/hall"
					})
				}

			} catch (err) {
				console.error(err)
				uni.showToast({
					title: "登录失败",
					icon: "none"
				})
			} finally {
				uni.hideLoading()
			}
		}
	}
}
</script>

<style scoped>
.login-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: 200rpx;
}
.title {
	font-size: 40rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
}
.subtitle {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 100rpx;
}

img{
	height: 400rpx;
	width: 400rpx;
}

.login-btn {
	width: 400rpx;
	height: 80rpx;
	background: #07c160;
	border-radius: 40rpx;
	color: #fff;
	font-size: 30rpx;
	border: none;
}
</style>
