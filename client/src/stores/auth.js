import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/api/services'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  async function fetchUser() {
    if (!token.value) return
    try {
      const res = await authAPI.getMe()
      if (res.success) {
        user.value = res.data.user
      }
    } catch (error) {
      console.error('获取用户信息失败', error)
      logout()
    }
  }

  async function login(phone, password) {
    loading.value = true
    try {
      const res = await authAPI.login({ phone, password })
      if (res.success) {
        token.value = res.data.token
        user.value = res.data.user
        localStorage.setItem('token', res.data.token)
        return { success: true }
      }
      return { success: false, message: res.message }
    } catch (error) {
      return { success: false, message: error.message }
    } finally {
      loading.value = false
    }
  }

  async function register(data) {
    loading.value = true
    try {
      const res = await authAPI.register(data)
      if (res.success) {
        token.value = res.data.token
        user.value = res.data.user
        localStorage.setItem('token', res.data.token)
        return { success: true }
      }
      return { success: false, message: res.message }
    } catch (error) {
      return { success: false, message: error.message }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await authAPI.logout()
    } catch (e) {
      // 忽略错误
    }
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    loading,
    isLoggedIn,
    fetchUser,
    login,
    register,
    logout
  }
})
