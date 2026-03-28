<template>
  <div class="min-h-screen">
    <!-- 头部 -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-lg border-b border-dark-700">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🎰</span>
          <span class="text-xl font-bold title-gradient">幸运抽奖</span>
        </div>
        <nav class="flex items-center gap-4">
          <router-link to="/dashboard" class="text-gold-500">我的</router-link>
          <button @click="handleLogout" class="text-gray-400 hover:text-red-400 transition">退出</button>
        </nav>
      </div>
    </header>

    <main class="pt-24 pb-10 px-4">
      <div class="container mx-auto max-w-4xl">
        <!-- 用户信息卡片 -->
        <div class="card mb-6 animate-slide-up">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-3xl">
              {{ user?.phone?.slice(0, 3) || '1' }}
            </div>
            <div>
              <h2 class="text-xl font-bold">{{ maskPhone(user?.phone) }}</h2>
              <p class="text-gray-400 text-sm">
                {{ user?.isGrandPrizeWinner ? '🎉 已中奖' : '未中奖' }}
              </p>
            </div>
          </div>

          <!-- 统计数据 -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-dark-700 rounded-xl p-4 text-center">
              <div class="text-2xl font-bold text-gold-500">{{ lotteryInfo.totalAmount || 0 }}</div>
              <div class="text-sm text-gray-400">订单总额(元)</div>
            </div>
            <div class="bg-dark-700 rounded-xl p-4 text-center">
              <div class="text-2xl font-bold text-purple-400">{{ boundOrderCount }}</div>
              <div class="text-sm text-gray-400">已绑定订单</div>
            </div>
            <div class="bg-dark-700 rounded-xl p-4 text-center">
              <div class="text-2xl font-bold text-green-400">{{ lotteryInfo.lotteryChances || 0 }}</div>
              <div class="text-sm text-gray-400">抽奖次数</div>
            </div>
            <div class="bg-dark-700 rounded-xl p-4 text-center">
              <div class="text-2xl font-bold text-blue-400">{{ user?.isGrandPrizeWinner ? '是' : '否' }}</div>
              <div class="text-sm text-gray-400">是否入围</div>
            </div>
          </div>
        </div>

        <!-- 大奖池状态 -->
        <div v-if="lotteryInfo.poolExists" class="card mb-6 animate-slide-up" style="animation-delay: 0.1s">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-2xl">🏅</span>
            <h3 class="text-lg font-bold">大奖候选池</h3>
            <span :class="[
              'px-2 py-1 rounded text-xs',
              lotteryInfo.isInPool ? 'bg-gold-500/20 text-gold-400' : 'bg-gray-500/20 text-gray-400'
            ]">
              {{ lotteryInfo.isInPool ? '您已进入候选池' : '暂未入围' }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <p class="text-gray-400 text-sm">
              {{ lotteryInfo.grandPrizeDrawn ? '大奖已抽取' : '大奖抽取中...' }}
            </p>
            <router-link v-if="lotteryInfo.isInPool && !lotteryInfo.grandPrizeDrawn" to="/lottery" class="btn btn-gold text-sm py-2 px-4">
              前往抽奖
            </router-link>
          </div>
        </div>

        <!-- 操作菜单 -->
        <div class="grid md:grid-cols-2 gap-4 animate-slide-up" style="animation-delay: 0.2s">
          <router-link to="/bind" class="card flex items-center gap-4 hover:border-gold-500/50">
            <div class="w-12 h-12 rounded-xl bg-gold-500/20 flex items-center justify-center text-2xl">📦</div>
            <div>
              <h4 class="font-bold">绑定订单</h4>
              <p class="text-sm text-gray-400">绑定微店订单号</p>
            </div>
          </router-link>

          <router-link to="/lottery" class="card flex items-center gap-4 hover:border-gold-500/50">
            <div class="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl">🎰</div>
            <div>
              <h4 class="font-bold">抽奖</h4>
              <p class="text-sm text-gray-400">剩余 {{ lotteryInfo.lotteryChances || 0 }} 次</p>
            </div>
          </router-link>

          <router-link to="/records" class="card flex items-center gap-4 hover:border-gold-500/50">
            <div class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl">📜</div>
            <div>
              <h4 class="font-bold">抽奖记录</h4>
              <p class="text-sm text-gray-400">查看我的中奖记录</p>
            </div>
          </router-link>

          <router-link to="/" class="card flex items-center gap-4 hover:border-gold-500/50">
            <div class="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-2xl">🏠</div>
            <div>
              <h4 class="font-bold">返回首页</h4>
              <p class="text-sm text-gray-400">活动说明</p>
            </div>
          </router-link>
        </div>

        <!-- 中奖公示 -->
        <div class="card mt-6 animate-slide-up" style="animation-delay: 0.3s">
          <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
            <span>🎊</span> 中奖公示
          </h3>
          <div v-if="winners.drawn" class="space-y-4">
            <div v-for="(item, level) in winners.data" :key="level" class="bg-dark-700 rounded-xl p-4">
              <h4 class="font-bold text-gold-500 mb-2">{{ item.level }}</h4>
              <div class="space-y-2">
                <div v-for="(winner, idx) in item.winners" :key="idx" class="flex justify-between text-sm">
                  <span class="text-gray-400">{{ winner.phone }}</span>
                  <span class="text-gray-500">订单金额: ¥{{ winner.totalAmount }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-400">
            <p class="text-4xl mb-2">⏳</p>
            <p>大奖正在等待抽取...</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { lotteryAPI, orderAPI } from '@/api/services'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user)

const lotteryInfo = reactive({
  totalAmount: 0,
  lotteryChances: 0,
  isInPool: false,
  grandPrizeDrawn: false,
  poolExists: false
})

const boundOrderCount = ref(0)
const winners = reactive({
  drawn: false,
  data: null
})

const maskPhone = (phone) => {
  if (!phone) return ''
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}

const fetchData = async () => {
  try {
    // 获取抽奖信息
    const infoRes = await lotteryAPI.getInfo()
    if (infoRes.success) {
      Object.assign(lotteryInfo, infoRes.data)
    }

    // 获取已绑定订单数
    const ordersRes = await orderAPI.getMyOrders()
    if (ordersRes.success) {
      boundOrderCount.value = ordersRes.data.orders.length
    }

    // 获取中奖信息
    const winnersRes = await lotteryAPI.getWinners()
    if (winnersRes.success) {
      winners.drawn = winnersRes.data.drawn
      winners.data = winnersRes.data.winners
    }
  } catch (error) {
    console.error('获取数据失败', error)
  }
}

onMounted(() => {
  authStore.fetchUser()
  fetchData()
})
</script>
