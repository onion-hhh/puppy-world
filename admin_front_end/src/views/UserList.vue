<template>
  <div class="user-list">
    <h2 class="page-title">用户管理</h2>
    
    <el-card>
      <el-table :data="userList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="nickname" label="昵称" width="150" />
        <el-table-column prop="avatar" label="头像" width="100">
          <template #default="{ row }">
            <el-avatar :src="row.avatar" :size="40" v-if="row.avatar" />
            <el-avatar :size="40" v-else>{{ row.nickname?.charAt(0) || '?' }}</el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="create_time" label="注册时间" width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="info" size="small" @click="showDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <el-dialog v-model="detailVisible" title="用户详情" width="500px">
      <el-descriptions :column="1" border v-if="currentUser">
        <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentUser.nickname }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentUser.phone }}</el-descriptions-item>
        <el-descriptions-item label="头像">
          <el-avatar :src="currentUser.avatar" :size="60" v-if="currentUser.avatar" />
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ currentUser.create_time }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminApi } from '../utils/api'
import { ElMessage } from 'element-plus'

const userList = ref([])
const loading = ref(false)
const detailVisible = ref(false)
const currentUser = ref(null)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await adminApi.getUserList()
    if (res.code === 200) {
      userList.value = (res.data || []).map(user => ({
        ...user,
        // 过滤微信小程序本地路径 wxfile:// 协议，浏览器无法识别
        avatar: user.avatar && !user.avatar.startsWith('wxfile://') ? user.avatar : ''
      }))
    }
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const showDetail = (row) => {
  currentUser.value = row
  detailVisible.value = true
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.user-list {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
}
</style>
