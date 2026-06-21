<template>
  <div class="comment-list">
    <h2 class="page-title">评论管理</h2>
    
    <el-card>
      <el-table :data="commentList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="place_name" label="地点" width="150" />
        <el-table-column prop="content" label="评论内容" min-width="300" />
        <el-table-column prop="score" label="评分" width="150">
          <template #default="{ row }">
            <el-rate v-model="row.score" disabled size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="评论时间" width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminApi } from '../utils/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const commentList = ref([])
const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await adminApi.getCommentList()
    if (res.code === 200) {
      commentList.value = res.data || []
    }
  } catch (error) {
    ElMessage.error('获取评论列表失败')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await adminApi.deleteComment(row.id)
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
.comment-list {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
}
</style>
