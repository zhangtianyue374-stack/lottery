<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <router-link to="/" class="inline-flex items-center gap-2">
          <span class="text-3xl">🎰</span>
          <span class="text-2xl font-bold title-gradient">幸运抽奖</span>
        </router-link>
      </div>

      <!-- 登录表单 -->
      <div class="card animate-slide-up">
        <h2 class="text-2xl font-bold text-center mb-6">登录账号</h2>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm text-gray-400 mb-2">手机号</label>
            <input
              v-model="form.phone"
              type="tel"
              class="input"
              placeholder="请输入手机号"
              maxlength="11"
              required
            />
          </div>

          <div>
            <label class="block text-sm text-gray-400 mb-2">密码</label>
            <input
              v-model="form.password"
              type="password"
              class="input"
              placeholder="请输入密码"
              required
            />
          </div>

          <div v-if="error" class="text-red-400 text-sm bg-red-400/10 rounded-lg p-3">
            {{ error }}
          </div>

          <button
            type="submit"
            class="btn btn-gold w-full"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner inline-block w-5 h-5 mr-2"></span>
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <p class="text-center text-gray-400 mt-6">
          还没有账号？
          <router-link to="/register" class="text-gold-500 hover:underline">立即注册</router-link>
        </p>
      </div>

      <!-- 管理入口 -->
      <p class="text-center mt-6">
        <router-link to="/admin" class="text-gray-500 text-sm hover:text-gold-500 transition">
          管理后台入口
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  phone: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  const result = await authStore.login(form.phone, form.password)

  if (result.success) {
    router.push('/dashboard')
  } else {
    error.value = result.message
  }

  loading.value = false
}
</script>
