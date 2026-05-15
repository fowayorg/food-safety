<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-message-text</v-icon>
      意见反馈管理
      <v-spacer />
      <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="搜索" density="compact" variant="outlined" hide-details class="me-2" style="max-width: 300px" />
    </v-card-title>
    <v-data-table :headers="headers" :items="items" :loading="loading" :search="search" class="elevation-0">
      <template #item.category="{ item }">
        <v-chip :color="catColorMap[item.category] || 'grey'" size="small">{{ catLabelMap[item.category] || item.category }}</v-chip>
      </template>
      <template #item.status="{ item }">
        <v-chip :color="statusColorMap[item.status] || 'grey'" size="small">{{ statusLabelMap[item.status] || item.status }}</v-chip>
      </template>
      <template #item.actions="{ item }">
        <v-btn icon="mdi-eye" variant="text" size="small" @click="viewDetail(item)" />
        <v-btn icon="mdi-check" variant="text" size="small" color="success" @click="handleProcess(item)" />
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { feedbackApi } from '../services/api'

const search = ref('')
const loading = ref(false)
const items = ref<any[]>([])

const headers = [
  { title: '反馈人', key: 'user.realName' },
  { title: '反馈类型', key: 'category' },
  { title: '反馈内容', key: 'content' },
  { title: '状态', key: 'status' },
  { title: '提交时间', key: 'createdAt' },
  { title: '操作', key: 'actions', sortable: false },
]

const catColorMap: Record<string, string> = { BUG: 'error', SUGGESTION: 'info', FEATURE: 'primary', OTHER: 'warning' }
const catLabelMap: Record<string, string> = { BUG: 'defect', SUGGESTION: 'suggestion', FEATURE: 'feature request', OTHER: 'other' }
const statusColorMap: Record<string, string> = { PENDING: 'warning', REPLIED: 'success' }
const statusLabelMap: Record<string, string> = { PENDING: 'pending', REPLIED: 'replied' }

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await feedbackApi.list()
    items.value = res.items || res || []
  } catch (e) {
    console.error(e)
    alert('load failed')
  }
  finally { loading.value = false }
}

const viewDetail = (item: any) => { alert('view: ' + item.id) }
const handleProcess = (_item: any) => { alert('in dev') }

onMounted(loadData)
</script>