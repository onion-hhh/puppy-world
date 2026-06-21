<template>
  <div class="dashboard">
    <h2 class="page-title">仪表盘</h2>
    
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6">
        <div class="stat-card blue">
          <div class="stat-icon"><User /></div>
          <div class="stat-info">
            <p class="stat-value">{{ stats.userCount }}</p>
            <p class="stat-label">用户总数</p>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card orange">
          <div class="stat-icon"><Location /></div>
          <div class="stat-info">
            <p class="stat-value">{{ stats.placeCount }}</p>
            <p class="stat-label">地点总数</p>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card red">
          <div class="stat-icon"><DocumentChecked /></div>
          <div class="stat-info">
            <p class="stat-value">{{ stats.applyCount }}</p>
            <p class="stat-label">待审核申请</p>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card green">
          <div class="stat-icon"><ChatDotRound /></div>
          <div class="stat-info">
            <p class="stat-value">{{ stats.commentCount }}</p>
            <p class="stat-label">评论总数</p>
          </div>
        </div>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <span>最近提交申请</span>
          </template>
          <el-table :data="recentApplies" style="width: 100%">
            <el-table-column prop="name" label="地点名称" />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="address" label="地址" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.status === 0" type="warning">待审核</el-tag>
                <el-tag v-else-if="row.status === 1" type="success">已通过</el-tag>
                <el-tag v-else type="danger">已拒绝</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="create_time" label="提交时间" width="180" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminApi } from '@/utils/api'

const stats = ref({
  userCount: 0,
  placeCount: 0,
  applyCount: 0,
  commentCount: 0
})

const recentApplies = ref([])

const fetchStats = async () => {
  try {
    const res = await adminApi.getStatistics()
    stats.value = res.data || stats.value
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const fetchRecentApplies = async () => {
  try {
    const res = await adminApi.getApplyList({ page: 1, limit: 5 })
    recentApplies.value = res.data || []
  } catch (error) {
    console.error('获取申请列表失败:', error)
  }
}

onMounted(() => {
  fetchStats()
  fetchRecentApplies()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  color: #fff;
}

.stat-card.blue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-card.orange { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-card.red { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }
.stat-card.green { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }

.stat-icon {
  font-size: 48px;
  margin-right: 20px;
  opacity: 0.8;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.chart-card {
  margin-bottom: 20px;
}
</style>
