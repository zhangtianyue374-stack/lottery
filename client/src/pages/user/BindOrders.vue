<template>
  <div class="min-h-screen">
    <!-- 头部 -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-lg border-b border-dark-700">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <router-link to="/dashboard" class="flex items-center gap-2 text-gray-400 hover:text-white transition">
          <span>←</span>
          <span>返回</span>
        </router-link>
        <span class="text-xl font-bold title-gradient">绑定订单</span>
        <div class="w-16"></div>
      </div>
    </header>

    <main class="pt-24 pb-10 px-4">
      <div class="container mx-auto max-w-2xl">
        <!-- 说明卡片 -->
        <div class="card mb-6 animate-slide-up">
          <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
            <span>📋</span> 绑定说明
          </h3>
          <ul class="space-y-2 text-gray-400 text-sm">
            <li>• 输入您的微店订单号，每行一个</li>
            <li>• 订单号只能绑定一次，不可解绑</li>
            <li>• 绑定后订单金额将计入您的抽奖总额</li>
            <li>• 订单金额越高，中奖概率越大</li>
          </ul>
        </div>

        <!-- 绑定表单 -->
        <div class="card mb-6 animate-slide-up" style="animation-delay: 0.1s">
          <h3 class="text-lg font-bold mb-4">输入订单号</h3>
          <form @submit.prevent="handleBind">
            <textarea
              v-model="orderNosText"
              class="input h-40 resize-none"
              placeholder="请输入订单号，每行一个&#10;例如：&#10;814076044092640&#10;814080634755055&#10;814076508613101"
            ></textarea>

            <div v-if="error" class="mt-4 text-red-400 text-sm bg-red-400/10 rounded-lg p-3">
              {{ error }}
            </div>

            <div v-if="success" class="mt-4 text-green-400 text-sm bg-green-400/10 rounded-lg p-3">
              {{ success }}
            </div>

            <button
              type="submit"
              class="btn btn-gold w-full mt-4"
              :disabled="loading || !orderNosText.trim()"
            >
              <span v-if="loading" class="spinner inline-block w-5 h-5 mr-2"></span>
              {{ loading ? '绑定中...' : '确认绑定' }}
            </button>
          </form>
        </div>

        <!-- 已绑定订单 -->
        <div class="card animate-slide-up" style="animation-delay: 0.2s">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold">已绑定订单</h3>
            <span class="text-gold-500 text-sm">{{ orders.length }} 个订单</span>
          </div>

          <div v-if="orders.length === 0" class="text-center py-8 text-gray-400">
            <p class="text-4xl mb-2">📦</p>
            <p>暂无已绑定的订单</p>
          </div>

          <div v-else class="space-y-2 max-h-96 overflow-y-auto">
            <div
              v-for="order in orders"
              :key="order._id"
              class="bg-dark-700 rounded-lg p-3 flex justify-between items-center"
            >
              <span class="text-sm font-mono">{{ order.orderNo }}</span>
              <span class="text-gold-500">¥{{ order.totalAmount }}</span>
            </div>
          </div>

          <!-- 统计 -->
          <div v-if="orders.length > 0" class="mt-4 pt-4 border-t border-dark-600">
            <div class="flex justify-between">
              <span class="text-gray-400">订单总额</span>
              <span class="text-xl font-bold text-gold-500">¥{{ totalAmount }}</span>
            </div>
            <div class="flex justify-between mt-2">
              <span class="text-gray-400">可抽奖次数</span>
              <span class="text-lg font-bold text-purple-400">{{ lotteryChances }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { orderAPI } from '@/api/services'

const orderNosText = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')
const orders = ref([])

const totalAmount = computed(() => {
  return orders.value.reduce((sum, o) => sum + o.totalAmount, 0)
})

const lotteryChances = computed(() => {
  const amount = totalAmount.value
  if (amount >= 5000) return 8
  if (amount >= 2000) return 5
  if (amount >= 500) return 3
  if (amount > 0) return 1
  return 0
})

const handleBind = async () => {
  error.value = ''
  success.value = ''

  const orderNos = orderNosText.value
    .split(/[\n,]/)
    .map(s => s.trim())
    .filter(s => s)

  if (orderNos.length === 0) {
    error.value = '请输入至少一个订单号'
    return
  }

  loading.value = true

  try {
    const res = await orderAPI.bindOrders(orderNos)
    if (res.success) {
      success.value = res.message
      orderNosText.value = ''
      await fetchOrders()
    } else {
      error.value = res.message
    }
  } catch (e) {
    error.value = e.message || '绑定失败'
  } finally {
    loading.value = false
  }
}

const fetchOrders = async () => {
  try {
    const res = await orderAPI.getMyOrders()
    if (res.success) {
      orders.value = res.data.orders
    }
  } catch (error) {
    console.error('获取订单失败', error)
  }
}

onMounted(() => {
  fetchOrders()
})
</script>
