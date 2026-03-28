<template>
  <div>
    <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="card">
        <div class="text-3xl mb-2">👥</div>
        <div class="text-2xl font-bold">{{ stats.totalUsers || 0 }}</div>
        <div class="text-sm text-gray-400">总用户数</div>
      </div>
      <div class="card">
        <div class="text-3xl mb-2">📦</div>
        <div class="text-2xl font-bold">{{ stats.boundUsers || 0 }}</div>
        <div class="text-sm text-gray-400">绑定用户</div>
      </div>
      <div class="card">
        <div class="text-3xl mb-2">🎁</div>
        <div class="text-2xl font-bold">{{ stats.winners || 0 }}</div>
        <div class="text-sm text-gray-400">中奖人数</div>
      </div>
      <div class="card">
        <div class="text-3xl mb-2">💰</div>
        <div class="text-2xl font-bold">¥{{ stats.totalAmount || 0 }}</div>
        <div class="text-sm text-gray-400">订单总额</div>
      </div>
    </div>

    <!-- 抽奖状态 -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">抽奖状态</h3>
        <span :class="[
          'px-3 py-1 rounded-full text-sm',
          stats.grandPrizeDrawn ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
        ]">
          {{ stats.grandPrizeDrawn ? '已抽取' : '待抽取' }}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="bg-dark-700 rounded-xl p-4">
          <div class="text-sm text-gray-400 mb-1">候选池人数</div>
          <div class="text-2xl font-bold text-gold-500">{{ stats.poolSize || 0 }}</div>
        </div>
        <div class="bg-dark-700 rounded-xl p-4">
          <div class="text-sm text-gray-400 mb-1">已绑定订单</div>
          <div class="text-2xl font-bold text-purple-400">{{ stats.boundOrders || 0 }}</div>
        </div>
      </div>

      <router-link to="/admin/lottery" class="btn btn-gold w-full mt-4">
        进入抽奖管理
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { adminAPI } from '@/api/services'

const stats = reactive({
  totalUsers: 0,
  boundUsers: 0,
  winners: 0,
  totalOrders: 0,
  boundOrders: 0,
  totalAmount: 0,
  poolExists: false,
  grandPrizeDrawn: false,
  poolSize: 0
})

const fetchStats = async () => {
  try {
    const res = await adminAPI.getStatistics()
    if (res.success) {
      Object.assign(stats, res.data)
    }
  } catch (error) {
    console.error('获取统计失败', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>
