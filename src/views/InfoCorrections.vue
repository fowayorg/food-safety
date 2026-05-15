<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-pencil-box-multiple</v-icon>
      信息更正管理
      <v-spacer />
      <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="搜索" density="compact" variant="outlined" hide-details class="me-2" style="max-width: 300px" />
    </v-card-title>
    <v-data-table :headers="headers" :items="items" :loading="loading" :search="search" class="elevation-0">
      <template #item.status="{ item }">
        <v-chip :color="statusColorMap[item.status] || 'grey'" size="small">{{ statusLabelMap[item.status] || item.status }}</v-chip>
      </template>
      <template #item.actions="{ item }">
        <v-btn icon="mdi-eye" variant="text" size="small" @click="viewDetail(item)" />
        <v-btn icon="mdi-check" variant="text" size="small" color="success" @click="handleApprove(item)" />
        <v-btn icon="mdi-close" variant="text" size="small" color="error" @click="handleReject(item)" />
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { infoCorrectionsApi } from '../services/api'

const search = ref('')
const loading = ref(false)
const items = ref<any[]>([])

const headers = [
  { title: '经营主体', key: 'entity.name' },
  { title: '更正类型', key: 'type' },
  { title: '原信息', key: 'originalValue' },
  { title: '新信息', key: 'newValue' },
  { title: '状态', key: 'status' },
  { title: '提交时间', key: 'createdAt' },
  { title: '操作', key: 'actions', sortable: false },
]

const statusColorMap: Record<string, string> = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'error' }
const statusLabelMap: Record<string, string> = { PENDING: '待审核', APPROVED: '已批准', REJECTED: '已拒绝' }

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await infoCorrectionsApi.list()
    items.value = res.items || res || []
  } catch (e) {
    console.error(e)
    alert('加载数据失败')
  }
  finally { loading.value = false }
}

const viewDetail = (item: any) => { alert(`查看信息更正: ${item.id}`) }

const handleApprove = async (item: any) => {
  if (!confirm('确定批准此更正申请？')) return
  try {
    await infoCorrectionsApi.review(item.id, { status: 'APPROVED' })
    loadData()
  } catch (e: any) { alert(e?.message || '操作失败') }
}

const handleReject = async (item: any) => {
  if (!confirm('确定拒绝此更正申请？')) return
  try {
    await infoCorrectionsApi.review(item.id, { status: 'REJECTED' })
    loadData()
  } catch (e: any) { alert(e?.message || '操作失败') }
}

onMounted(loadData)
</script>