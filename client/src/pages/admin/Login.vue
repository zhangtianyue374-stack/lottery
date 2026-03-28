<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold title-gradient">管理后台</h1>
        <p class="text-gray-400 mt-2">幸运抽奖系统</p>
      </div>

      <div class="card">
        <h2 class="text-xl font-bold text-center mb-6">管理员登录</h2>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm text-gray-400 mb-2">用户名</label>
            <input
              v-model="form.username"
              type="text"
              class="input"
              placeholder="请输入用户名"
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

          <button type="submit" class="btn btn-gold w-full" :disabled="loading">
            <span v-if="loading" class="spinner inline-block w-5 h-5 mr-2"></span>
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <p class="text-center mt-4">
          <router-link to="/" class="text-gray-400 text-sm hover:text-gold-500 transition">
            返回活动首页
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '@/api/services'

const router = useRouter()

const form = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    const res = await authAPI.adminLogin(form)
    if (res.success) {
      localStorage.setItem('adminToken', res.data.token)
      router.push('/admin/dashboard')
    } else {
      error.value = res.message
    }
  } catch (e) {
    error.value = e.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>
