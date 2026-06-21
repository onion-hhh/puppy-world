<template>
  <view class="publish-page">
    <!-- 头部 -->
    <view class="header">
      <view class="title">提交宠物友好地点</view>
    </view>

    <!-- 表单主体 -->
    <view class="form-container">
      <!-- 地点名称（必填） -->
      <view class="form-item">
        <text class="label">地点名称</text>
        <input class="input" placeholder="请输入地点名称" v-model="form.name" />
      </view>

      <!-- 地点类型（下拉选择） -->
      <view class="form-item">
        <text class="label">地点类型</text>
        <picker 
          class="picker"
          mode="selector"
          :range="typeOptions"
          :value="form.typeIndex"
          @change="onTypeChange"
        >
          <view class="picker-text">{{ form.typeText || '请选择地点类型' }}</view>
        </picker>
      </view>

      <!-- 详细地址（必填） -->
      <view class="form-item">
        <text class="label">详细地址</text>
        <input 
          class="input" 
          placeholder="点击选择位置" 
          :value="form.address"
          disabled
          @tap="chooseLoc"
        />
      </view>

      <!-- 联系电话（可空） -->
      <view class="form-item">
        <text class="label">联系电话（选填）</text>
        <input class="input" placeholder="请输入联系电话" v-model="form.phone" />
      </view>

      <!-- 营业时间 -->
      <view class="form-item">
        <text class="label">营业时间</text>
        <input class="input" placeholder="例如：9:00-22:00" v-model="form.businessHours" />
      </view>

      <!-- 入内规则 -->
      <view class="form-item">
        <text class="label">宠物友好规则</text>
        <textarea class="textarea" placeholder="例如：牵绳即可" v-model="form.rules" maxlength="200" />
      </view>

      <!-- 标签 -->
      <view class="form-item">
        <text class="label">标签（逗号分隔）</text>
        <input class="input" placeholder="例如：宠物友好,免费" v-model="form.tags" />
      </view>

      <button class="submit-btn" @tap="submitForm">提交</button>
    </view>
  </view>
</template>

<script>
import { post } from '@/utils/request.js'

export default {
  data() {
    return {
	  typeOptions: ['公园', '超市', '餐厅', '医院'],
      form: {
        name: '',
        type: '',
		typeIndex: -1,
		typeText: '',
        address: '',
        phone: '',
        businessHours: '',
        rules: '',
        tags: '',
        latitude: null,
        longitude: null
      }
    }
  },
  methods: {
    async chooseLoc() {
      try {
        const res = await uni.chooseLocation()
		console.log(res);
        this.form.address = res.name || res.address
        this.form.latitude = res.latitude
        this.form.longitude = res.longitude
      } catch (e) {
        uni.showToast({ title: '选择位置失败', icon: 'none' })
      }
    },
	onTypeChange(e) {
      const index = parseInt(e.detail.value, 10)
      this.form.typeIndex = index
      this.form.typeText = this.typeOptions[index]
      this.form.type = index + 1
    },
	resetForm() {
	  this.form = {
	    name: '',
	    type: '',
	    typeIndex: -1,
	    typeText: '',
	    address: '',
	    phone: '',
	    businessHours: '',
	    rules: '',
	    tags: '',
	    latitude: null,
	    longitude: null
	  }
	},

    async submitForm() {
      if (!this.form.name.trim()) {
        uni.showToast({ title: '请输入地点名称', icon: 'none' })
        return
      }
      if (!this.form.type) {
        uni.showToast({ title: '请选择地点类型', icon: 'none' })
        return
      }
      if (!this.form.address.trim()) {
        uni.showToast({ title: '请选择详细地址', icon: 'none' })
        return
      }
      if (!this.form.businessHours.trim()) {
        uni.showToast({ title: '请输入营业时间', icon: 'none' })
        return
      }
      if (!this.form.rules.trim()) {
        uni.showToast({ title: '请输入宠物友好规则', icon: 'none' })
        return
      }
      if (!this.form.tags.trim()) {
        uni.showToast({ title: '请输入标签', icon: 'none' })
        return
      }
	  if (this.form.phone) {
	    const phoneReg = /^1[3-9]\d{9}$/
	    if (!phoneReg.test(this.form.phone)) {
	      uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
	      return
	    }
	  }

      uni.showLoading({ title: '提交中...' })

      try {
        await post('/apply/submit', {
          name: this.form.name,
          type: this.form.type,
          address: this.form.address,
          phone: this.form.phone || null,
          businessHours: this.form.businessHours || null,
          rules: this.form.rules || null,
          tags: this.form.tags || null,
          latitude: this.form.latitude || null,
          longitude: this.form.longitude || null
        })

        uni.hideLoading()
        uni.showToast({ title: '提交成功', icon: 'success' })
		this.resetForm()

        setTimeout(() => {
          uni.switchTab({
            url: '/pages/hall/hall'
          })
        }, 1500)

      } catch (err) {
        uni.hideLoading()
        uni.showToast({ title: '提交失败，请重试', icon: 'none' })
        console.error('提交失败：', err)
      }
    }
  }
}
</script>

<style scoped>
.publish-page {
  background: #78b9ff;
  min-height: 100vh;
}
.header {
  background: #409eff;
  height: 120rpx;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  color: #fff;
}
.title {
  font-size: 34rpx;
  font-weight: bold;
  flex: 1;
  text-align: center;
}
.form-container {
  background: #fff;
  margin: 30rpx;
  border-radius: 16rpx;
  padding: 40rpx;
}
.form-item {
  margin-bottom: 40rpx;
}
.label {
  display: block;
  font-size: 30rpx;
  margin-bottom: 20rpx;
  color: #333;
}
.input {
  width: 90%;
  height: 80rpx;
  border: 1rpx solid #bfbfbf;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}
.input[disabled] {
  background: #f5f7fa;
  color: #666;
}
.textarea {
  width: 90%;
  height: 160rpx;
  border: 1rpx solid #bfbfbf;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
}
.submit-btn {
  width: 100%;
  height: 88rpx;
  background: #ffc107;
  color: #333;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  margin-top: 20rpx;
}
.picker {
  width: 90%;
  height: 80rpx;
  border: 1rpx solid #bfbfbf;
  border-radius: 8rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
}
.picker-text {
  font-size: 28rpx;
  color: #333;
}
</style>