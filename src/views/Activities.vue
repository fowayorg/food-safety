<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-account-group</v-icon>
      社会共治活动
      <v-spacer />
      <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="搜索" density="compact" variant="outlined" hide-details class="me-2" style="max-width: 300px" />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">新增活动</v-btn>
    </v-card-title>
    <v-data-table :headers="headers" :items="items" :loading="loading" :search="search" class="elevation-0">
      <template #item.participants="{ item }">
        <span>{{ item._count?.participants ?? 0 }}</span>
      </template>
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
import { activitiesApi } from '../services/api'

const search = ref('')
const loading = ref(false)
const items = ref<any[]>([])

const headers = [
  { title: '活动名称', key: 'name' },
  { title: '活动类型', key: 'type' },
  { title: '参与人数', key: 'participants' },
  { title: '状态', key: 'status' },
  { title: '开始时间', key: 'startDate' },
  { title: '操作', key: 'actions', sortable: false },
]
const statusColorMap: Record<string, string> = { DRAFT: 'warning', PUBLISHED: 'info', ACTIVE: 'success', ENDED: 'grey', CANCELLED: 'error' }
const statusLabelMap: Record<string, string> = { DRAFT: '草稿', PUBLISHED: '已发布', ACTIVE: '进行中', ENDED: '已结束', CANCELLED: '已取消' }

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await activitiesApi.list()
    items.value = res.items || res || []
  } catch (e) {
    console.error(e)
    alert('加载数据失败')
  }
  finally { loading.value = false }
}

const openDialog = (_item?: any) => { alert('活动表单 - 功能开发中') }
const viewDetail = (item: any) => { alert(`查看活动: ${item.name}`) }

onMounted(loadData)
</script>