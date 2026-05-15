<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-clipboard-check-outline</v-icon>
      自查自纠管理
      <v-spacer />
      <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="搜索" density="compact" variant="outlined" hide-details class="me-2" style="max-width: 300px" />
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
import { selfInspectionsApi } from '../services/api'

const search = ref('')
const loading = ref(false)
const items = ref<any[]>([])

const headers = [
  { title: '自查主体', key: 'entity.name' },
  { title: '自查类型', key: 'type' },
  { title: '自查日期', key: 'inspectedAt' },
  { title: '操作人', key: 'operator.realName' },
  { title: '状态', key: 'status' },
  { title: '操作', key: 'actions', sortable: false },
]

const statusColorMap: Record<string, string> = { SUBMITTED: 'warning', REVIEWED: 'success' }
const statusLabelMap: Record<string, string> = { SUBMITTED: '待审核', REVIEWED: '已审核' }

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await selfInspectionsApi.list()
    items.value = res.items || res || []
  } catch (e) {
    console.error(e)
    alert('加载数据失败')
  }
  finally { loading.value = false }
}

const openDialog = (_item?: any) => { alert('自查自纠表单 - 功能开发中') }
const viewDetail = (item: any) => { alert('查看详情: ' + item.id) }

onMounted(loadData)
</script>