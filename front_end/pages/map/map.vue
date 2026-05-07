<template>
  <view class="map-container">
    <map
      :longitude="mapCenterLng"
      :latitude="mapCenterLat"
      :markers="markers"
      show-location
      @markertap="onMarkerTap"
      style="width: 100%; height: 100vh;"
    />
	<!-- 自定义弹窗 -->
	<view class="modal-overlay" v-if="showModal" @tap="closeModal">
	  <view class="modal-content" @tap.stop>
	    <view class="modal-title">{{ currentMarker.title }}</view>
	    <view class="modal-info">
	      <view>地址：{{ currentMarker.address }}</view>
	      <view>评分：{{ currentMarker.avgScore }}</view>
	    </view>
	    <view class="modal-buttons">
	      <view class="btn cancel" @tap="closeModal">取消</view>
	      <view class="btn confirm" @tap="openNav">去这里</view>
	    </view>
	  </view>
	</view>
  </view>
</template>

<script>
import {get} from '@/utils/request.js'
export default {
  data() {
    return {
      // 默认中心设为北京（和你数据库里的中央公园一致）
      mapCenterLat: 39.9309,
      mapCenterLng: 116.4017,
      markers: [],
	  showModal: false,
	  currentMarker: {}
    };
  },
  onLoad() {
    // 先加载所有地点，不管定位是否成功
    this.loadAllPlaces();
    // 再尝试定位，更新地图中心
    this.tryGetLocation();
  },
  methods: {
    // 【关键】直接加载所有宠物地点，绕过定位失败的问题
    async loadAllPlaces() {
      try {
        // 直接用默认坐标请求 showAll=true，拿到所有地点
        const res = await get(
			  "/place/nearby",
			  {
				lat: this.mapCenterLat,
				lng: this.mapCenterLng,
				showAll: "true"
			  })

        console.log("接口返回的所有地点：", res.data);

        // 转换为地图标记
        this.markers = res.data.map(item => ({
          id: item.id,
          latitude: item.latitude,
          longitude: item.longitude,
          title: item.name,
		  address: item.address,
		  avgScore: item.avgScore,
		  iconPath: "/static/logo.png",
          width: 32,
          height: 32
        }));

        console.log("生成的markers：", this.markers);
      } catch (err) {
        console.error("加载地点失败：", err);
        uni.showToast({ title: "加载地点失败", icon: "none" });
      }
    },

    // 尝试定位，失败也不影响地点显示
    async tryGetLocation() {
      try {
        const res = await uni.getLocation({
          type: "gcj02",
          isHighAccuracy: true
        });
        console.log("定位成功：", res.latitude, res.longitude);
        // 更新地图中心为用户位置
        this.mapCenterLat = res.latitude;
        this.mapCenterLng = res.longitude;
      } catch (err) {
        console.log("定位失败，使用默认中心：", err);
        uni.showToast({ title: "定位失败，使用默认地图", icon: "none" });
      }
    },
	onMarkerTap(e) {
	  const marker = this.markers.find(m => m.id === e.detail.markerId);
	  if (!marker) return;
	  
	  this.currentMarker = marker;
	  this.showModal = true;
	},
	closeModal() {
	  this.showModal = false;
	},
	// 导航功能
	openNav() {
	  uni.openLocation({
	    latitude: Number(this.currentMarker.latitude),
	    longitude: Number(this.currentMarker.longitude),
	    name: this.currentMarker.title,
	    address: this.currentMarker.address
	  });
	  this.closeModal();
	}  
  }
};
</script>
<!-- 错误3修复：加上弹窗样式 -->
<style scoped>
.container {
  width: 100%;
  height: 100vh;
  position: relative;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal-content {
  width: 80%;
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
}
.modal-title {
  font-size: 34rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20rpx;
}
.modal-info {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 30rpx;
}
.modal-buttons {
  display: flex;
  border-top: 1rpx solid #eee;
}
.btn {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  font-size: 30rpx;
}
.confirm {
  color: #007aff;
  border-left: 1rpx solid #eee;
}
</style>