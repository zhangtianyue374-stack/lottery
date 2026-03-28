<template>
  <div class="min-h-screen flex flex-col">
    <!-- 头部 -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-lg border-b border-dark-700">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🎰</span>
          <span class="text-xl font-bold title-gradient">幸运抽奖</span>
        </div>
        <nav class="flex items-center gap-4">
          <template v-if="!authStore.isLoggedIn">
            <router-link to="/login" class="btn btn-outline text-sm py-2 px-4">登录</router-link>
            <router-link to="/register" class="btn btn-gold text-sm py-2 px-4">注册</router-link>
          </template>
          <template v-else>
            <router-link to="/dashboard" class="text-gray-300 hover:text-gold-500 transition">我的</router-link>
            <button @click="handleLogout" class="text-gray-300 hover:text-red-400 transition">退出</button>
          </template>
        </nav>
      </div>
    </header>

    <!-- 主内容 -->
    <main class="flex-1 flex items-center justify-center pt-20 pb-10">
      <div class="container mx-auto px-4 text-center">
        <!-- 标题 -->
        <div class="animate-fade-in mb-12">
          <h1 class="text-5xl md:text-7xl font-bold mb-4">
            <span class="title-gradient">年度盛典</span>
          </h1>
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">奢华抽奖盛典</h2>
          <p class="text-gray-400 text-lg max-w-2xl mx-auto">
            绑定您的微店订单号，即可参与抽奖。订单金额越高，中奖概率越大！
          </p>
        </div>

        <!-- 奖品展示 -->
        <div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12 animate-slide-up">
          <div class="card text-center">
            <div class="text-5xl mb-4">🏆</div>
            <h3 class="text-2xl font-bold text-gold-400 mb-2">一等奖</h3>
            <p class="text-gray-400">神秘大奖 × 1</p>
          </div>
          <div class="card text-center transform scale-105">
            <div class="text-5xl mb-4">🥈</div>
            <h3 class="text-2xl font-bold text-purple-400 mb-2">二等奖</h3>
            <p class="text-gray-400">精致好礼 × 2</p>
          </div>
          <div class="card text-center">
            <div class="text-5xl mb-4">🥉</div>
            <h3 class="text-2xl font-bold text-gray-400 mb-2">三等奖</h3>
            <p class="text-gray-400">精选好物 × 2</p>
          </div>
        </div>

        <!-- 参与按钮 -->
        <div class="animate-slide-up" style="animation-delay: 0.2s">
          <template v-if="!authStore.isLoggedIn">
            <router-link to="/register" class="btn btn-gold text-xl px-12 py-4">
              立即参与
            </router-link>
            <p class="text-gray-500 mt-4 text-sm">已有账号？<router-link to="/login" class="text-gold-500 hover:underline">立即登录</router-link></p>
          </template>
          <template v-else>
            <div class="flex flex-wrap justify-center gap-4">
              <router-link to="/bind" class="btn btn-gold text-lg px-8 py-4">
                绑定订单
              </router-link>
              <router-link to="/lottery" class="btn btn-purple text-lg px-8 py-4">
                进入抽奖
              </router-link>
            </div>
          </template>
        </div>

        <!-- 规则说明 -->
        <div class="mt-16 max-w-2xl mx-auto text-left">
          <h3 class="text-2xl font-bold text-gold-500 mb-4 text-center">活动规则</h3>
          <ul class="space-y-3 text-gray-400">
            <li class="flex items-start gap-3">
              <span class="text-gold-500">1.</span>
              <span>注册并绑定您的微店订单号</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-gold-500">2.</span>
              <span>订单总额越高，获得的抽奖次数越多</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-gold-500">3.</span>
              <span>大奖候选池仅限订单总额排名前10用户</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-gold-500">4.</span>
              <span>每人最多中奖一次</span>
            </li>
          </ul>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="text-center py-6 text-gray-500 text-sm">
      © 2026 幸运抽奖盛典. All rights reserved.
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>
