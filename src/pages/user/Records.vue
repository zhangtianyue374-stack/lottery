<template>
  <div class="min-h-screen">
    <!-- 头部 -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-lg border-b border-dark-700">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <router-link to="/dashboard" class="flex items-center gap-2 text-gray-400 hover:text-white transition">
          <span>←</span>
          <span>返回</span>
        </router-link>
        <span class="text-xl font-bold title-gradient">抽奖记录</span>
        <div class="w-16"></div>
      </div>
    </header>

    <main class="pt-24 pb-10 px-4">
      <div class="container mx-auto max-w-2xl">
        <!-- 记录列表 -->
        <div class="card animate-slide-up">
          <h3 class="text-lg font-bold mb-4">我的抽奖记录</h3>

          <div v-if="loading" class="text-center py-8">
            <div class="spinner mx-auto"></div>
          </div>

          <div v-else-if="records.length === 0" class="text-center py-8 text-gray-400">
            <p class="text-4xl mb-2">📜</p>
            <p>暂无抽奖记录</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="record in records"
              :key="record._id"
              :class="[
                'p-4 rounded-xl',
                record.wonPrize !== 'none' ? 'bg-gold-500/20 border border-gold-500/30' : 'bg-dark-700'
              ]"
            >
              <div class="flex justify-between items-start">
                <div>
                  <div class="flex items-center gap-2">
                    <span :class="[
                      'px-2 py-0.5 rounded text-xs',
                      record.wonPrize === 'none' ? 'bg-gray-600 text-gray-300' :
                      record.wonPrize === 'first' ? 'bg-gold-500 text-dark-900' :
                      record.wonPrize === 'second' ? 'bg-gray-400 text-dark-900' :
                      'bg-amber-600 text-white'
                    ]">
                      {{ getPrizeName(record.wonPrize) }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-400 mt-2">订单号: {{ record.orderNo }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ formatDate(record.drawTime) }}</p>
                </div>
                <div v-if="record.wonPrize !== 'none'" class="text-2xl">
                  {{ getPrizeEmoji(record.wonPrize) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { lotteryAPI } from '@/api/services'

const loading = ref(true)
const records = ref([])

const getPrizeName = (prize) => {
  const names = {
    none: '未中奖',
    first: '一等奖',
    second: '二等奖',
    third: '三等奖'
  }
  return names[prize] || prize
}

const getPrizeEmoji = (prize) => {
  const emojis = {
    none: '😢',
    first: '🏆',
    second: '🥈',
    third: '🥉'
  }
  return emojis[prize] || '❓'
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchRecords = async () => {
  loading.value = true
  try {
    const res = await lotteryAPI.getMyRecords()
    if (res.success) {
      records.value = res.data.records
    }
  } catch (error) {
    console.error('获取记录失败', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRecords()
})
</script>
