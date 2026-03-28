<template>
  <div>
    <!-- 操作区 -->
    <div class="card mb-6">
      <h3 class="text-lg font-bold mb-4">大奖管理</h3>

      <!-- 生成候选池 -->
      <div class="mb-6 p-4 bg-dark-700 rounded-xl">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-bold mb-1">生成大奖候选池</h4>
            <p class="text-sm text-gray-400">根据用户订单总额排序，生成前10名候选池</p>
          </div>
          <button
            @click="handleGeneratePool"
            :disabled="generating"
            class="btn btn-gold"
          >
            {{ generating ? '生成中...' : '生成候选池' }}
          </button>
        </div>
        <div v-if="poolInfo.poolSize > 0" class="mt-4 text-sm text-gold-500">
          ✓ 候选池已生成，共 {{ poolInfo.poolSize }} 名用户入围
        </div>
      </div>

      <!-- 抽取大奖 -->
      <div class="p-4 bg-dark-700 rounded-xl">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-bold mb-1">抽取大奖</h4>
            <p class="text-sm text-gray-400">
              <span class="text-gold-500">一等奖1名</span>、
              <span class="text-gray-400">二等奖2名</span>、
              <span class="text-amber-600">三等奖2名</span>
            </p>
          </div>
          <button
            @click="handleDraw"
            :disabled="drawing || poolInfo.grandPrizeDrawn || poolInfo.poolSize === 0"
            class="btn btn-purple"
          >
            {{ drawing ? '抽取中...' : poolInfo.grandPrizeDrawn ? '已抽取' : '开始抽取' }}
          </button>
        </div>
        <div v-if="poolInfo.grandPrizeDrawn" class="mt-4 text-sm text-green-400">
          ✓ 大奖已抽取完毕
        </div>
      </div>

      <!-- 结果 -->
      <div v-if="message" :class="[
        'mt-4 p-4 rounded-lg',
        message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
      ]">
        {{ message.text }}
      </div>
    </div>

    <!-- 候选池名单 -->
    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold">候选池名单</h3>
        <button
          v-if="poolInfo.grandPrizeDrawn"
          @click="handleExport"
          class="btn btn-outline text-sm py-2"
        >
          导出中奖名单
        </button>
      </div>

      <div v-if="poolInfo.rankings?.length === 0" class="text-center py-8 text-gray-400">
        <p>暂无候选池数据</p>
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="item in poolInfo.rankings"
          :key="item.rank"
          :class="[
            'flex items-center gap-3 p-3 rounded-lg',
            item.rank <= 3 ? 'bg-gold-500/10 border border-gold-500/30' : 'bg-dark-700'
          ]"
        >
          <div :class="[
            'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
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

    <!-- 中奖结果弹窗 -->
    <Teleport to="body">
      <div v-if="showResult" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <div class="card text-center max-w-md mx-4 animate-slide-up">
          <div v-if="drawResults.winners?.length > 0" class="text-gold-500">
            <p class="text-5xl mb-4">🎉</p>
            <h2 class="text-2xl font-bold mb-4">大奖抽取完成！</h2>
            <div class="space-y-4 text-left">
              <div v-for="w in drawResults.winners" :key="w.level" class="bg-dark-700 rounded-lg p-3">
                <div class="text-gold-500 font-bold">{{ w.level }}</div>
                <div class="text-gray-400 text-sm mt-1">手机号: {{ w.phone }}</div>
              </div>
            </div>
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
import { ref, reactive, onMounted } from 'vue'
import { adminAPI, lotteryAPI } from '@/api/services'

const generating = ref(false)
const drawing = ref(false)
const showResult = ref(false)
const message = ref(null)
const drawResults = reactive({ winners: [] })

const poolInfo = reactive({
  poolSize: 0,
  grandPrizeDrawn: false,
  rankings: []
})

const fetchPoolInfo = async () => {
  try {
    const res = await lotteryAPI.getPoolRankings()
    if (res.success) {
      poolInfo.rankings = res.data.rankings || []
      poolInfo.poolSize = res.data.rankings?.length || 0
      poolInfo.grandPrizeDrawn = res.data.grandPrizeDrawn || false
    }
  } catch (error) {
    console.error('获取候选池失败', error)
  }
}

const handleGeneratePool = async () => {
  generating.value = true
  message.value = null

  try {
    const res = await adminAPI.generatePool()
    if (res.success) {
      message.value = { type: 'success', text: res.message }
      await fetchPoolInfo()
    } else {
      message.value = { type: 'error', text: res.message }
    }
  } catch (error) {
    message.value = { type: 'error', text: error.message || '生成失败' }
  } finally {
    generating.value = false
  }
}

const handleDraw = async () => {
  drawing.value = true
  message.value = null

  try {
    const res = await adminAPI.drawGrandPrize({
      firstPrizeCount: 1,
      secondPrizeCount: 2,
      thirdPrizeCount: 2
    })

    if (res.success) {
      // 获取中奖用户信息
      const winnersRes = await lotteryAPI.getWinners()
      if (winnersRes.success && winnersRes.data.winners) {
        const winners = []
        if (winnersRes.data.winners.first?.winners?.[0]) {
          winners.push({
            level: '一等奖',
            phone: winnersRes.data.winners.first.winners[0].phone
          })
        }
        winnersRes.data.winners.second?.winners?.forEach((w, i) => {
          winners.push({ level: '二等奖', phone: w.phone })
        })
        winnersRes.data.winners.third?.winners?.forEach((w, i) => {
          winners.push({ level: '三等奖', phone: w.phone })
        })
        drawResults.winners = winners
        showResult.value = true
      }
      await fetchPoolInfo()
      message.value = { type: 'success', text: '大奖抽取完成' }
    } else {
      message.value = { type: 'error', text: res.message }
    }
  } catch (error) {
    message.value = { type: 'error', text: error.message || '抽取失败' }
  } finally {
    drawing.value = false
  }
}

const handleExport = async () => {
  try {
    const res = await adminAPI.exportWinners()
    const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '中奖名单.xlsx'
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    message.value = { type: 'error', text: '导出失败' }
  }
}

onMounted(() => {
  fetchPoolInfo()
})
</script>
