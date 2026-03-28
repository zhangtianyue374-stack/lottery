<template>
  <div>
    <!-- 上传订单 -->
    <div class="card mb-6">
      <h3 class="text-lg font-bold mb-4">上传微店订单表</h3>
      <div class="border-2 border-dashed border-dark-600 rounded-xl p-8 text-center hover:border-gold-500/50 transition cursor-pointer"
           @click="$refs.fileInput.click()"
           @dragover.prevent
           @drop.prevent="handleDrop">
        <input ref="fileInput" type="file" accept=".xlsx,.xls" class="hidden" @change="handleFileSelect" />
        <div class="text-4xl mb-2">📤</div>
        <p class="text-gray-400 mb-2">{{ uploading ? '上传中...' : '点击或拖拽上传 Excel 文件' }}</p>
        <p class="text-sm text-gray-500">支持 .xlsx, .xls 格式</p>
      </div>

      <div v-if="uploadResult" :class="[
        'mt-4 p-4 rounded-lg',
        uploadResult.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
      ]">
        {{ uploadResult.message }}
      </div>
    </div>

    <!-- 订单统计 -->
    <div class="card">
      <h3 class="text-lg font-bold mb-4">订单概览</h3>
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-dark-700 rounded-xl p-4">
          <div class="text-sm text-gray-400 mb-1">总订单数</div>
          <div class="text-2xl font-bold">{{ stats.totalOrders || 0 }}</div>
        </div>
        <div class="bg-dark-700 rounded-xl p-4">
          <div class="text-sm text-gray-400 mb-1">已绑定</div>
          <div class="text-2xl font-bold text-gold-500">{{ stats.boundOrders || 0 }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { adminAPI } from '@/api/services'

const fileInput = ref(null)
const uploading = ref(false)
const uploadResult = ref(null)

const stats = reactive({
  totalOrders: 0,
  boundOrders: 0
})

const handleFileSelect = async (e) => {
  const file = e.target.files[0]
  if (file) {
    await uploadFile(file)
  }
}

const handleDrop = async (e) => {
  const file = e.dataTransfer.files[0]
  if (file) {
    await uploadFile(file)
  }
}

const uploadFile = async (file) => {
  uploading.value = true
  uploadResult.value = null

  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await adminAPI.uploadOrders(formData)
    uploadResult.value = { success: res.success, message: res.message || res.error?.message }
    if (res.success) {
      await fetchStats()
    }
  } catch (error) {
    uploadResult.value = { success: false, message: error.message || '上传失败' }
  } finally {
    uploading.value = false
  }
}

const fetchStats = async () => {
  try {
    const res = await adminAPI.getStatistics()
    if (res.success) {
      stats.totalOrders = res.data.totalOrders
      stats.boundOrders = res.data.boundOrders
    }
  } catch (error) {
    console.error('获取统计失败', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>
