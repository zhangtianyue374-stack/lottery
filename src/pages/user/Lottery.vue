<template>
  <div class="min-h-screen">
    <!-- 头部 -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-lg border-b border-dark-700">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <router-link to="/dashboard" class="flex items-center gap-2 text-gray-400 hover:text-white transition">
          <span>←</span>
          <span>返回</span>
        </router-link>
        <span class="text-xl font-bold title-gradient">抽奖</span>
        <div class="w-16"></div>
      </div>
    </header>

    <main class="pt-24 pb-10 px-4">
      <div class="container mx-auto max-w-4xl">
        <!-- 大奖公示滚动 -->
        <div v-if="winners.drawn" class="card mb-6 animate-slide-up">
          <div class="flex items-center gap-2 mb-4">
            <span class="text-2xl">🎊</span>
            <h3 class="text-lg font-bold">中奖公示</h3>
          </div>
          <div class="winner-ticker bg-dark-700 rounded-lg p-4">
            <div class="winner-ticker-content whitespace-nowrap">
              <span v-for="(item, idx) in [...Array(2)]" :key="idx" class="mx-4">
                <template v-for="level in ['一等奖', '二等奖', '三等奖']" :key="level">
                  <span class="text-gold-500">{{ level }}：</span>
                  <span class="text-white mx-2">恭喜XXX</span>
                  <span class="text-gray-400 mx-4">|</span>
                </template>
              </span>
            </div>
          </div>
        </div>

        <!-- 抽奖区 -->
        <div class="card mb-6 animate-slide-up" style="animation-delay: 0.1s">
          <!-- 用户状态 -->
          <div class="text-center mb-8">
            <div v-if="!lotteryInfo.isInPool" class="text-gray-400">
              <p class="text-4xl mb-2">🔒</p>
              <p>您暂未入围大奖候选池</p>
              <p class="text-sm mt-1">请绑定更多订单提升排名</p>
              <router-link to="/bind" class="btn btn-gold mt-4 inline-block">
                去绑定订单
              </router-link>
            </div>

            <div v-else-if="lotteryInfo.isGrandPrizeWinner" class="text-gold-500">
              <p class="text-5xl mb-2">🎉</p>
              <p class="text-2xl font-bold">恭喜您已中奖！</p>
              <p class="text-lg mt-2">{{ getPrizeName(lotteryInfo.prizeLevel) }}</p>
            </div>

            <div v-else-if="lotteryInfo.grandPrizeDrawn && !lotteryInfo.isGrandPrizeWinner" class="text-gray-400">
              <p class="text-4xl mb-2">😢</p>
              <p>大奖已抽取完毕</p>
              <p class="text-sm mt-1">感谢您的参与</p>
            </div>

            <div v-else>
              <p class="text-gray-400 mb-2">您已进入大奖候选池</p>
              <p class="text-sm text-gray-500">点击下方按钮抽取大奖</p>
            </div>
          </div>

          <!-- 抽奖按钮/结果 -->
          <div class="text-center">
            <div v-if="lotteryInfo.isInPool && !lotteryInfo.isGrandPrizeWinner && !lotteryInfo.grandPrizeDrawn" class="mb-8">
              <button
                @click="handleLottery"
                :disabled="lottering"
                class="btn btn-gold text-xl px-16 py-6 rounded-full breathing-glow"
                :class="{ 'opacity-50 cursor-not-allowed': lottering }"
              >
                <span v-if="lottering" class="spinner inline-block w-6 h-6 mr-2"></span>
                {{ lottering ? '抽奖中...' : '抽取大奖' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 大奖池排名 -->
        <div class="card animate-slide-up" style="animation-delay: 0.2s">
          <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
            <span>🏅</span> 大奖候选池
          </h3>

          <div v-if="rankings.length === 0" class="text-center py-8 text-gray-400">
            <p>大奖池尚未生成</p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="(item, idx) in rankings"
              :key="idx"
              :class="[
                'flex items-center gap-3 p-3 rounded-lg',
                item.rank <= 3 ? 'bg-gold-500/10 border border-gold-500/30' : 'bg-dark-700'
              ]"
            >
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center font-bold',
                item.rank === 1 ? 'bg-gold-500 text-dark-900' :
                item.rank === 2 ? 'bg-gray-400 text-dark-900' :
                item.rank === 3 ? 'bg-amber-600 text-white' :
                'bg-dark-600 text-gray-400'
              ]">
                {{ item.rank }}
              </div>
              <div class="flex-1">
                <span class="font-mono">{{ item.phone }}</span>
              </div>
              <div class="text-right">
                <span class="text-gold-500 font-bold">¥{{ item.totalAmount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 中奖弹窗 -->
    <Teleport to="body">
      <div v-if="showResult" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div class="card text-center max-w-md mx-4 animate-slide-up">
          <div v-if="hasWon" class="text-gold-500">
            <p class="text-6xl mb-4">🎉</p>
            <h2 class="text-3xl font-bold mb-2">恭喜您！</h2>
            <p class="text-xl">{{ getPrizeName(prizeResult) }}</p>
            <p class="text-gray-400 mt-4">请保持联系方式畅通</p>
          </div>
          <div v-else class="text-gray-400">
            <p class="text-6xl mb-4">😅</p>
            <h2 class="text-2xl font-bold mb-2">很遗憾</h2>
            <p>本次未中奖</p>
            <p class="text-sm mt-2">感谢您的参与</p>
          </div>
          <button @click="showResult = false" class="btn btn-outline mt-6">
            关闭
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { lotteryAPI } from '@/api/services'

const lotteryInfo = reactive({
  isInPool: false,
  isGrandPrizeWinner: false,
  prizeLevel: null,
  grandPrizeDrawn: false
})

const rankings = ref([])
const winners = reactive({ drawn: false, data: null })
const lottering = ref(false)
const showResult = ref(false)
const hasWon = ref(false)
const prizeResult = ref('')

const getPrizeName = (level) => {
  const names = {
    first: '一等奖',
    second: '二等奖',
    third: '三等奖'
  }
  return names[level] || ''
}

const fetchData = async () => {
  try {
    const [infoRes, poolRes, winnersRes] = await Promise.all([
      lotteryAPI.getInfo(),
      lotteryAPI.getPoolRankings(),
      lotteryAPI.getWinners()
    ])

    if (infoRes.success) {
      Object.assign(lotteryInfo, infoRes.data)
    }

    if (poolRes.success) {
      rankings.value = poolRes.data.rankings || []
    }

    if (winnersRes.success) {
      winners.drawn = winnersRes.data.drawn
      winners.data = winnersRes.data.winners
    }
  } catch (error) {
    console.error('获取数据失败', error)
  }
}

const handleLottery = async () => {
  lottering.value = true

  try {
    // 模拟抽奖动画
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 抽奖结果由后台决定
    // 前端只显示结果
    hasWon.value = lotteryInfo.isGrandPrizeWinner
    prizeResult.value = lotteryInfo.prizeLevel
    showResult.value = true

    // 刷新数据
    await fetchData()
  } catch (error) {
    console.error('抽奖失败', error)
  } finally {
    lottering.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
