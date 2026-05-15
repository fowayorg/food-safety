<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-alert-circle</v-icon>
      风险排查管理
      <v-spacer />
      <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="搜索" density="compact" variant="outlined" hide-details class="me-2" style="max-width: 300px" />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">新增排查</v-btn>
    </v-card-title>
    <v-data-table :headers="headers" :items="items" :loading="loading" :search="search" class="elevation-0">
      <template #item.status="{ item }">
        <v-chip :color="statusColorMap[item.status] || 'grey'" size="small">{{ statusLabelMap[item.status] || item.status }}</v-chip>
      </template>
      <template #item.actions="{ item }">
        <v-btn icon="mdi-eye" variant="text" size="small" @click="viewDetail(item)" />
        <v-btn icon="mdi-pencil" variant="text" size="small" @click="openDialog(item)" />
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { screeningsApi } from '../services/api'

const search = ref('')
const loading = ref(false)
const items = ref<any[]>([])

const headers = [
  { title: '排查编号', key: 'id' },
  { title: '经营主体', key: 'entity.name' },
  { title: '排查人员', key: 'screener.realName' },
  { title: '状态', key: 'status' },
  { title: '排查时间', key: 'screenedAt' },
  { title: '操作', key: 'actions', sortable: false },
]

const statusColorMap: Record<string, string> = { PENDING: 'warning', PROCESSING: 'info', COMPLETED: 'success', CANCELLED: 'grey' }
const statusLabelMap: Record<string, string> = { PENDING: '待处理', PROCESSING: '处理中', COMPLETED: '已完成', CANCELLED: '已取消' }

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await screeningsApi.list()
    items.value = res.items || res || []
  } catch (e) {
    console.error(e)
    alert('加载数据失败')
  }
  finally { loading.value = false }
}

const openDialog = (_item?: any) => { alert('风险排查表单 - 功能开发中') }
const viewDetail = (item: any) => { alert('查看详情: ' + item.id) }

onMounted(loadData)
</script>