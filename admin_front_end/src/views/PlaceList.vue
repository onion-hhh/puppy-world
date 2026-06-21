<template>
  <div class="place-list">
    <h2 class="page-title">地点管理</h2>
    
    <el-card>
      <el-table :data="placeList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="地点名称" width="150" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ getTypeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" min-width="200" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="avgScore" label="评分" width="150">
          <template #default="{ row }">
            <el-rate v-model="row.avgScore" disabled size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="collectCount" label="收藏数" width="80" />
        <el-table-column prop="commentCount" label="评论数" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '显示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="showDetail(row)">详情</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <el-dialog v-model="detailVisible" title="地点详情" width="600px">
      <el-descriptions :column="2" border v-if="currentPlace">
        <el-descriptions-item label="地点名称">{{ currentPlace.name }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ currentPlace.type }}</el-descriptions-item>
        <el-descriptions-item label="地址" :span="2">{{ currentPlace.address }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentPlace.phone }}</el-descriptions-item>
        <el-descriptions-item label="营业时间">{{ currentPlace.businessHours }}</el-descriptions-item>
        <el-descriptions-item label="规定" :span="2">{{ currentPlace.rules }}</el-descriptions-item>
        <el-descriptions-item label="评分">{{ currentPlace.avgScore }}</el-descriptions-item>
        <el-descriptions-item label="收藏数">{{ currentPlace.collectCount }}</el-descriptions-item>
        <el-descriptions-item label="评论数">{{ currentPlace.commentCount }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminApi } from '../utils/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const placeList = ref([])
const loading = ref(false)
const detailVisible = ref(false)
const currentPlace = ref(null)

const getTypeLabel = (type) => {
  const typeMap = {
    1: '公园',
    2: '超市',
    3: '餐厅',
    4: '医院'
  }
  return typeMap[type] || '未知类型'
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await adminApi.getPlaceList()
    if (res.code === 200) {
      placeList.value = (res.data || []).map(item => ({
        ...item,
        avgScore: Number(item.avgScore) || 0
      }))
    }
  } catch (error) {
    ElMessage.error('获取地点列表失败')
  } finally {
    loading.value = false
  }
}

const showDetail = (row) => {
  currentPlace.value = row
  detailVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该地点吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await adminApi.deletePlace(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.place-list {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
}
</style>
