<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <router-link to="/" class="inline-flex items-center gap-2">
          <span class="text-3xl">🎰</span>
          <span class="text-2xl font-bold title-gradient">幸运抽奖</span>
        </router-link>
      </div>

      <!-- 注册表单 -->
      <div class="card animate-slide-up">
        <h2 class="text-2xl font-bold text-center mb-6">创建账号</h2>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm text-gray-400 mb-2">手机号 <span class="text-red-400">*</span></label>
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
            <label class="block text-sm text-gray-400 mb-2">微信号</label>
            <input
              v-model="form.wechatId"
              type="text"
              class="input"
              placeholder="请输入微信号（便于中奖联系）"
            />
          </div>

          <div>
            <label class="block text-sm text-gray-400 mb-2">微博号</label>
            <input
              v-model="form.weiboId"
              type="text"
              class="input"
              placeholder="请输入微博号（便于中奖联系）"
            />
          </div>

          <div>
            <label class="block text-sm text-gray-400 mb-2">密码 <span class="text-red-400">*</span></label>
            <input
              v-model="form.password"
              type="password"
              class="input"
              placeholder="请输入密码（至少6位）"
              minlength="6"
              required
            />
          </div>

          <div>
            <label class="block text-sm text-gray-400 mb-2">确认密码 <span class="text-red-400">*</span></label>
            <input
              v-model="form.confirmPassword"
              type="password"
              class="input"
              placeholder="请再次输入密码"
              minlength="6"
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
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </form>

        <p class="text-center text-gray-400 mt-6">
          已有账号？
          <router-link to="/login" class="text-gold-500 hover:underline">立即登录</router-link>
        </p>
      </div>
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
  wechatId: '',
  weiboId: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  error.value = ''

  if (form.password !== form.confirmPassword) {
    error.value = '两次密码输入不一致'
    return
  }

  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    error.value = '请输入正确的手机号'
    return
  }

  loading.value = true

  const result = await authStore.register({
    phone: form.phone,
    wechatId: form.wechatId,
    weiboId: form.weiboId,
    password: form.password,
    confirmPassword: form.confirmPassword
  })

  if (result.success) {
    router.push('/dashboard')
  } else {
    error.value = result.message
  }

  loading.value = false
}
</script>
