<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="p-6 border-b border-dark-700">
        <h1 class="text-xl font-bold title-gradient">管理后台</h1>
      </div>
      <nav class="p-4 space-y-2">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-lg transition',
            $route.path === item.path
              ? 'bg-gold-500/20 text-gold-500'
              : 'text-gray-400 hover:bg-dark-700 hover:text-white'
          ]"
        >
          <span>{{ item.icon }}</span>
          <span>{{ item.name }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- 主内容 -->
    <div class="main-content">
      <!-- 顶部栏 -->
      <header class="topbar">
        <h2 class="text-lg font-bold">{{ currentTitle }}</h2>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-400">{{ new Date().toLocaleDateString() }}</span>
          <button @click="handleLogout" class="text-gray-400 hover:text-red-400 transition">
            退出
          </button>
        </div>
      </header>

      <!-- 内容区 -->
      <div class="content-area">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authAPI } from '@/api/services'

const router = useRouter()
const route = useRoute()

const menuItems = [
  { path: '/admin/dashboard', name: '仪表盘', icon: '📊' },
  { path: '/admin/orders', name: '订单管理', icon: '📦' },
  { path: '/admin/users', name: '用户管理', icon: '👥' },
  { path: '/admin/lottery', name: '抽奖管理', icon: '🎰' }
]

const currentTitle = computed(() => {
  const item = menuItems.find(m => m.path === route.path)
  return item?.name || '后台管理'
})

const handleLogout = async () => {
  try {
    await authAPI.adminLogout()
  } catch (e) {}
  localStorage.removeItem('adminToken')
  router.push('/admin')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 256px;
  background: #1A1A2E;
  border-right: 1px solid #16213E;
  z-index: 40;
}

.main-content {
  margin-left: 256px;
  flex: 1;
  min-height: 100vh;
}

.topbar {
  position: sticky;
  top: 0;
  background: rgba(15, 15, 26, 0.8);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid #16213E;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 30;
}

.content-area {
  padding: 24px;
}
</style>
