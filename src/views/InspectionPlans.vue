<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-clipboard-text</v-icon>
      检查计划管理
      <v-spacer />
      <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="搜索" density="compact" variant="outlined" hide-details class="me-2" style="max-width: 300px" />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">新建计划</v-btn>
    </v-card-title>
    <v-data-table :headers="headers" :items="items" :loading="loading" :search="search" class="elevation-0">
      <template #item.status="{ item }">
        <v-chip :color="statusColorMap[item.status] || 'grey'" size="small">{{ statusLabelMap[item.status] || item.status }}</v-chip>
      </template>
      <template #item._count="{ item }">
        <span>{{ item._count?.tasks || 0 }}</span>
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
import { inspectionPlansApi } from '../services/api'

const search = ref('')
const loading = ref(false)
const items = ref<any[]>([])

const headers = [
  { title: '计划名称', key: 'name' },
  { title: '计划类型', key: 'type' },
  { title: '开始日期', key: 'startDate' },
  { title: '结束日期', key: 'endDate' },
  { title: '状态', key: 'status' },
  { title: '任务数', key: '_count' },
  { title: '创建人', key: 'creator.username' },
  { title: '操作', key: 'actions', sortable: false },
]

const statusColorMap: Record<string, string> = { DRAFT: 'warning', PUBLISHED: 'info', IN_PROGRESS: 'primary', COMPLETED: 'success', CANCELLED: 'grey' }
const statusLabelMap: Record<string, string> = { DRAFT: '草稿', PUBLISHED: '已发布', IN_PROGRESS: '进行中', COMPLETED: '已完成', CANCELLED: '已取消' }

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await inspectionPlansApi.list()
    items.value = res.items || res || []
  } catch (e) {
    console.error(e)
    alert('加载数据失败')
  }
  finally { loading.value = false }
}

const openDialog = (_item?: any) => { alert('检查计划表单 - 功能开发中') }
const viewDetail = (item: any) => { alert('查看计划: ' + item.name) }

onMounted(loadData)
</script>