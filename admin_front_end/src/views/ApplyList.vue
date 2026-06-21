<template>
  <div class="apply-list">
    <h2 class="page-title">申请审核</h2>
    
    <el-card class="audit-logs-card" style="margin-bottom: 20px;">
      <template #header>
        <span>最近一周AI审核记录</span>
      </template>
      <el-table :data="auditLogs" v-loading="logsLoading" style="width: 100%">
        <el-table-column prop="apply_id" label="申请ID" width="100" />
        <el-table-column prop="name" label="地点名称" width="150" />
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            {{ getTypeLabel(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="audit_type" label="审核类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.audit_type === 'auto' ? 'info' : 'warning'">
              {{ row.audit_type === 'auto' ? '自动审核' : '人工审核' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="rule_score" label="规则评分" width="100" />
        <el-table-column prop="ai_score" label="AI评分" width="100" />
        <el-table-column prop="final_score" label="综合评分" width="100" />
        <el-table-column prop="final_decision" label="审核结果" width="120">
          <template #default="{ row }">
            <el-tag :type="row.final_decision === 1 ? 'success' : row.final_decision === 0 ? 'warning' : 'danger'">
              {{ row.final_decision === 1 ? '通过' : row.final_decision === 0 ? '待人工' : '拒绝' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reject_reason" label="拒绝原因" min-width="200" />
        <el-table-column prop="created_at" label="审核时间" width="180" />
      </el-table>
    </el-card>
    
    <el-card>
      <el-table :data="applyList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="地点名称" width="150" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            {{ getTypeLabel(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" min-width="200" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="businessHours" label="营业时间" width="120" />
        <el-table-column prop="tags" label="标签" width="120">
          <template #default="{ row }">
            <el-tag v-for="tag in (row.tags || '').split(',')" :key="tag" size="small" style="margin-right: 5px">
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="warning">待审核</el-tag>
            <el-tag v-else-if="row.status === 1" type="success">已通过</el-tag>
            <el-tag v-else type="danger">已拒绝</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="申请时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 0">
              <el-button type="success" size="small" @click="handleAudit(row, 1)">通过</el-button>
              <el-button type="danger" size="small" @click="handleReject(row)">拒绝</el-button>
            </template>
            <el-button type="primary" size="small" @click="showDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <el-dialog v-model="detailVisible" title="申请详情" width="600px">
      <el-descriptions :column="2" border v-if="currentApply">
        <el-descriptions-item label="地点名称">{{ currentApply.name }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ currentApply.type }}</el-descriptions-item>
        <el-descriptions-item label="地址" :span="2">{{ currentApply.address }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentApply.phone }}</el-descriptions-item>
        <el-descriptions-item label="营业时间">{{ currentApply.businessHours }}</el-descriptions-item>
        <el-descriptions-item label="规定" :span="2">{{ currentApply.rules }}</el-descriptions-item>
        <el-descriptions-item label="标签" :span="2">
          <el-tag v-for="tag in (currentApply.tags || '').split(',')" :key="tag" size="small" style="margin-right: 5px">
            {{ tag }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="图片" :span="2">
          <el-image 
            v-for="(img, idx) in (currentApply.images || '').split(',')" 
            :key="idx"
            :src="img" 
            style="width: 100px; height: 100px; margin-right: 10px"
            fit="cover"
            :preview-src-list="(currentApply.images || '').split(',')"
          />
        </el-descriptions-item>
        <el-descriptions-item label="坐标" :span="2">
          {{ currentApply.latitude }}, {{ currentApply.longitude }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    
    <el-dialog v-model="rejectVisible" title="拒绝原因" width="400px">
      <el-input v-model="rejectReason" type="textarea" :rows="4" placeholder="请输入拒绝原因" />
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { adminApi } from '../utils/api'
import { ElMessage } from 'element-plus'

const applyList = ref([])
const auditLogs = ref([])
const loading = ref(false)
const logsLoading = ref(false)
const detailVisible = ref(false)
const rejectVisible = ref(false)
const currentApply = ref(null)
const rejectReason = ref('')

const typeMap = {
  1: '公园',
  2: '超市',
  3: '餐厅',
  4: '医院'
}

const getTypeLabel = (type) => {
  const numType = Number(type)
  return typeMap[numType] || `未知类型(${type})`
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await adminApi.getApplyList()
    if (res.code === 200) {
      applyList.value = res.data || []
    }
  } catch (error) {
    ElMessage.error('获取申请列表失败')
  } finally {
    loading.value = false
  }
}

const fetchAuditLogs = async () => {
  logsLoading.value = true
  try {
    const res = await adminApi.getAuditLogs(24)
    if (res.code === 200) {
      auditLogs.value = res.data || []
    }
  } catch (error) {
    console.error('获取审核日志失败:', error)
  } finally {
    logsLoading.value = false
  }
}

const showDetail = (row) => {
  currentApply.value = row
  detailVisible.value = true
}

const handleAudit = async (row, status) => {
  try {
    const res = await adminApi.auditApply({ applyId: row.id, status, reason: '' })
    const code = Number(res.code)
    if (code === 200) {
      ElMessage.success(res.message || (status === 1 ? '审核通过' : '已拒绝'))
      fetchData()
    } else {
      ElMessage.error(res.message || '审核失败')
    }
  } catch (error) {
    ElMessage.error('审核失败')
    console.log(error)
  }
}

const handleReject = (row) => {
  currentApply.value = row
  rejectReason.value = ''
  rejectVisible.value = true
}

const confirmReject = async () => {
  try {
    const res = await adminApi.auditApply({ 
      applyId: currentApply.value.id, 
      status: 2, 
      reason: rejectReason.value 
    })
    // 统一转换为数字进行比较，避免类型不匹配
    const code = Number(res.code)
    if (code === 200) {
      // 显示后端返回的消息，如果没有则显示默认消息
      ElMessage.success(res.message || '已拒绝')
      rejectVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.message || '审核失败')
    }
  } catch (error) {
    ElMessage.error('审核失败')
  }
}

onMounted(() => {
  fetchData()
  fetchAuditLogs()
})
</script>

<style scoped>
.apply-list {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
}
</style>
