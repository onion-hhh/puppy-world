<template>
  <view class="hall">
    <!-- 整体顶部蓝色区域+搜索框 一起吸顶 -->
    <view class="header-wrap">
		<view class="search-bar-row">
		        <u-search 
		          :showAction="true" 
		          :animation="true"
		          v-model="keywords" 
		          :height="70" 
		          class="search-input"
				  searchIconSize="45"
		        ></u-search>
		        <!-- 地图入口按钮 → 和搜索框同行 -->
		        <view class="map-btn" @click="goToMap">
		          <text class="icon">🌍️️</text>
		        </view>
		</view>
    </view>

    <!-- 内容列表 -->
    <view class="content">
      <view class="item-card" v-for="item in showList" :key="item.id" @tap="goDetail(item.id)">
        <view class="left">
          <view class="dog-avatar"></view>
          <view class="info">
            <view class="title">{{item.name}}</view>
            <view class="addr">📍 {{item.address}}</view>
			<u-rate :value="item.avgScore" size="25" activeColor="#5094f1" allowHalf="true" readonly></u-rate>
          </view>
        </view>
        <view class="right">
          <view class="score">{{item.avgScore}}</view>
          <view class="tag">{{item.tags}}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { get } from '@/utils/request.js'
export default {
  data() {
    return {
		keywords:'',
		list: [],
		timer: null,
		searchKeyword: '' // 真正用来搜索的词（防抖后才更新）
    }
  },
  onLoad() {
  	this.getList()
  },
  computed: {
      // 实时搜索，但走防抖控制
      showList() {
        // 返回一个新数组，不影响原 list
        const kw = this.searchKeyword.toLowerCase().trim();
        if (!kw) return this.list;
  
        return this.list.filter((item) => {
          return (
            item.name.toLowerCase().includes(kw) ||
            item.address.toLowerCase().includes(kw)
          );
        });
      }
	},
	watch: {
	    // 监听关键词变化 → 加防抖
	    keywords(val) {
	      clearTimeout(this.timer)
	      this.timer = setTimeout(() => {
	        // 350ms 后才把输入值给搜索关键词
	        this.searchKeyword = val
	      }, 400) // 防抖时间
	    }
	  },
  methods:{
	  async getList(){
		  try{
			  const res = await get('/place/list')
			  if (res.code === 200){
				  this.list = res.data
				  console.log(res.data);
			  }
		  }catch (err){
			  console.log('加载失败', err);
		  }
	  },
	  
  // 跳转详情
      goDetail(id) {
        uni.navigateTo({
          url: '/pages/hall/components/detail/detail?id=' + id
        })
      },
	  goToMap(){
		  uni.navigateTo({
		  	url: "/pages/map/map"
		  })
	  }
  }
}
</script>

<style scoped>
.hall {
  background: #78b9ff;
  /* 关键：给吸顶头部留出高度，防止内容被挡住 */
  padding-top: 160rpx;
}

/* 核心：整体蓝色头部 + 搜索框 一体吸顶 */
.header-wrap {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: #409eff;
  padding: 60rpx 30rpx 30rpx;
  border-bottom-left-radius: 30rpx;
  border-bottom-right-radius: 30rpx;
}
/* 新增：让搜索框和地图按钮在同一行 */
.search-bar-row {
  display: flex;
  align-items: center;
  gap: 20rpx; /* 搜索框和按钮之间的间距 */
}

/* 给搜索框设置 flex 占满剩余空间 */
.search-input {
  flex: 1;
}

/* 地图按钮样式调整 */
.map-btn {
  width: 70rpx;
  height: 70rpx;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; /* 防止按钮被压缩 */
}
.icon {
  font-size: 80rpx;
}
.content {
  padding: 20rpx;
}

.item-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
}

.left {
  display: flex;
  align-items: flex-start;
}

.dog-avatar {
  width: 90rpx;
  height: 90rpx;
  background: #ffd343;
  border-radius: 16rpx;
}

.info {
  margin-left: 20rpx;
  width: 300rpx; /* 固定宽度，根据你想要的长度调整 */
  white-space: nowrap; /* 不换行 */
  overflow: hidden; /* 超出隐藏 */
  text-overflow: ellipsis; /* 超出用...代替 */
}

.title {
  font-size: 32rpx;
  font-weight: bold;
}

.addr {
  font-size: 24rpx;
  color: #666;
  margin: 8rpx 0;
}

.right {
  text-align: right;
}

.score {
  font-size: 30rpx;
  color: #333;
}

.tag {
  background: #5094f1;
  color: #fff;
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 30rpx;
  margin-top: 10rpx;
  width: 133rpx; /* 固定宽度，根据你想要的长度调整 */
  white-space: nowrap; /* 不换行 */
  overflow: hidden; /* 超出隐藏 */
  text-overflow: ellipsis; /* 超出用...代替 */
}
</style>