<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-phone</v-icon>
      投诉举报管理
      <v-spacer />
      <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="搜索" density="compact" variant="outlined" hide-details class="me-2" style="max-width: 300px" />
      <v-btn v-if="selected.length" color="error" prepend-icon="mdi-delete-sweep" class="me-2" @click="handleBatchDelete">批量删除 ({{ selected.length }})</v-btn>
      <v-btn color="success" prepend-icon="mdi-file-export" variant="outlined" class="me-2" @click="exportsApi.download('complaints')">导出</v-btn>
    </v-card-title>
    <v-data-table v-model="selected" :headers="headers" :items="items" :loading="loading" :search="search" :return-object="true" show-select class="elevation-0">
      <template #item.status="{ item }">
        <v-chip :color="statusColorMap[item.status] || 'grey'" size="small">{{ statusLabelMap[item.status] || item.status }}</v-chip>
      </template>
      <template #item.actions="{ item }">
        <v-btn icon="mdi-eye" variant="text" size="small" @click="viewDetail(item)" />
        <v-btn icon="mdi-pencil" variant="text" size="small" @click="handleProcess(item)" />
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { complaintsApi, exportsApi } from '../services/api'

const search = ref('')
const loading = ref(false)
const items = ref<any[]>([])
const selected = ref<any[]>([])

const headers = [
  { title: '投诉编号', key: 'id' },
  { title: '投诉人', key: 'reporterName' },
  { title: '联系电话', key: 'reporterPhone' },
  { title: '经营主体', key: 'entity.name' },
  { title: '状态', key: 'status' },
  { title: '提交时间', key: 'createdAt' },
  { title: '操作', key: 'actions', sortable: false },
]

const statusColorMap: Record<string, string> = { PENDING: 'warning', FIRST_HANDLING: 'info', FIRST_FEEDBACK: 'info', SECOND_HANDLING: 'info', SECOND_FEEDBACK: 'info', RESOLVED: 'success', CLOSED: 'grey' }
const statusLabelMap: Record<string, string> = { PENDING: '待处理', FIRST_HANDLING: '初核中', FIRST_FEEDBACK: '初核反馈', SECOND_HANDLING: '复核中', SECOND_FEEDBACK: '复核反馈', RESOLVED: '已解决', CLOSED: '已关闭' }

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await complaintsApi.list()
    items.value = res.items || res || []
  } catch (e) {
    console.error(e)
    alert('加载数据失败')
  }
  finally { loading.value = false }
}

const viewDetail = (item: any) => { alert(`查看投诉详情: ${item.id}`) }
const handleProcess = (_item: any) => { alert('处理投诉 - 功能开发中') }

const handleBatchDelete = async () => {
  if (!selected.value.length) return
  if (!confirm(`确定删除 ${selected.value.length} 条投诉记录？此操作不可撤销`)) return
  try {
    await complaintsApi.batchDelete(selected.value.map((i: any) => i.id))
    alert(`成功删除 ${selected.value.length} 条投诉记录`)
    selected.value = []
    loadData()
  } catch (e: any) { alert('批量删除失败: ' + (e?.response?.data?.message || e?.message)) }
}

onMounted(loadData)
</script>