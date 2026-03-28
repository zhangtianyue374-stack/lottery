<template>
  <div>
    <!-- 搜索 -->
    <div class="card mb-6">
      <div class="flex gap-4">
        <input
          v-model="searchKeyword"
          type="text"
          class="input flex-1"
          placeholder="搜索手机号或微信号"
          @keyup.enter="handleSearch"
        />
        <button @click="handleSearch" class="btn btn-gold">
          搜索
        </button>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold">用户列表</h3>
        <span class="text-gray-400 text-sm">共 {{ pagination.total }} 人</span>
      </div>

      <div v-if="loading" class="text-center py-8">
        <div class="spinner mx-auto"></div>
      </div>

      <div v-else-if="users.length === 0" class="text-center py-8 text-gray-400">
        <p>暂无用户数据</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="text-left text-gray-400 text-sm border-b border-dark-700">
              <th class="pb-3">手机号</th>
              <th class="pb-3">微信号</th>
              <th class="pb-3">微博号</th>
              <th class="pb-3">订单总额</th>
              <th class="pb-3">状态</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in users"
              :key="user._id"
              class="border-b border-dark-700/50 hover:bg-dark-700/30"
            >
              <td class="py-3 font-mono">{{ user.phone }}</td>
              <td class="py-3 text-gray-400">{{ user.wechatId || '-' }}</td>
              <td class="py-3 text-gray-400">{{ user.weiboId || '-' }}</td>
              <td class="py-3">
                <span class="text-gold-500 font-bold">¥{{ user.totalAmount || 0 }}</span>
              </td>
              <td class="py-3">
                <span v-if="user.isGrandPrizeWinner" class="px-2 py-1 rounded text-xs bg-gold-500/20 text-gold-400">
                  {{ getPrizeName(user.prizeLevel) }}
                </span>
                <span v-else-if="user.totalAmount > 0" class="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
                  已绑定
                </span>
                <span v-else class="px-2 py-1 rounded text-xs bg-gray-500/20 text-gray-400">
                  未绑定
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div v-if="pagination.pages > 1" class="flex justify-center gap-2 mt-4">
        <button
          v-for="page in pagination.pages"
          :key="page"
          @click="goToPage(page)"
          :class="[
            'px-3 py-1 rounded text-sm',
            page === pagination.page
              ? 'bg-gold-500 text-dark-900'
              : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
          ]"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { adminAPI } from '@/api/services'

const loading = ref(false)
const searchKeyword = ref('')
const users = ref([])
const pagination = reactive({
  total: 0,
  page: 1,
  pages: 1
})

const getPrizeName = (level) => {
  const names = { first: '一等奖', second: '二等奖', third: '三等奖' }
  return names[level] || ''
}

const fetchUsers = async (page = 1, search = '') => {
  loading.value = true
  try {
    const res = await adminAPI.getUsers({ page, limit: 20, search })
    if (res.success) {
      users.value = res.data.users
      pagination.total = res.data.pagination.total
      pagination.page = res.data.pagination.page
      pagination.pages = res.data.pagination.pages
    }
  } catch (error) {
    console.error('获取用户失败', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  fetchUsers(1, searchKeyword.value)
}

const goToPage = (page) => {
  fetchUsers(page, searchKeyword.value)
}

onMounted(() => {
  fetchUsers()
})
</script>
