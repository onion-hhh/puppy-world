<template>
  <div class="layout-container">
    <aside class="sidebar">
      <div class="logo">
        <h3>汪汪世界</h3>
        <p>管理后台</p>
      </div>
      <el-menu 
        :default-active="activeMenu" 
        router 
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/apply-list">
          <el-icon><DocumentChecked /></el-icon>
          <span>申请审核</span>
          <el-badge v-if="pendingCount > 0" :value="pendingCount" type="danger" class="badge" />
        </el-menu-item>
        <el-menu-item index="/place-list">
          <el-icon><Location /></el-icon>
          <span>地点管理</span>
        </el-menu-item>
        <el-menu-item index="/user-list">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/comment-list">
          <el-icon><ChatDotRound /></el-icon>
          <span>评论管理</span>
        </el-menu-item>
      </el-menu>
    </aside>
    
    <div class="main-container">
      <header class="navbar">
        <div class="navbar-left">
          <el-icon class="collapse-btn" @click="collapsed = !collapsed">
            <Fold v-if="!collapsed" />
            <Expand v-else />
          </el-icon>
        </div>
        <div class="navbar-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><User /></el-icon>
              <span>管理员</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { adminApi } from '@/utils/api'

const router = useRouter()
const route = useRoute()
const collapsed = ref(false)
const pendingCount = ref(0)

const activeMenu = computed(() => route.path)

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      localStorage.removeItem('adminToken')
      router.push('/login')
    }).catch(() => {})
  }
}

const fetchPendingCount = async () => {
  try {
    const res = await adminApi.getApplyList({ page: 1, limit: 1 })
    pendingCount.value = res.data?.length || 0
  } catch (error) {
    console.error('获取待审核数量失败:', error)
  }
}

onMounted(() => {
  fetchPendingCount()
})
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 200px;
  background: #304156;
  overflow-y: auto;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #3d4a5c;
}

.logo h3 {
  color: #fff;
  font-size: 18px;
  margin-bottom: 5px;
}

.logo p {
  color: #999;
  font-size: 12px;
}

.badge {
  margin-left: 10px;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.navbar {
  height: 60px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f5f7fa;
}
</style>
