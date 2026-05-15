<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-clipboard-text-multiple</v-icon>
      检查模板管理
      <v-spacer />
      <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="搜索" density="compact" variant="outlined" hide-details class="me-2" style="max-width: 300px" />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">新建模板</v-btn>
    </v-card-title>
    <v-data-table :headers="headers" :items="items" :loading="loading" :search="search" class="elevation-0">
      <template #item.type="{ item }">
        <v-chip color="primary" size="small">{{ typeMap[item.type] || item.type }}</v-chip>
      </template>
      <template #item.items="{ item }">
        <span>{{ item.items?.length || 0 }}</span>
      </template>
      <template #item.status="{ item }">
        <v-chip :color="getStatusColor(item.status)" size="small">{{ getStatusLabel(item.status) }}</v-chip>
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
import { inspectionTemplatesApi } from '../services/api'

const search = ref('')
const loading = ref(false)
const items = ref<any[]>([])

const headers = [
  { title: '模板名称', key: 'name' },
  { title: '检查类型', key: 'type' },
  { title: '适用行业', key: 'industry' },
  { title: '项目数量', key: 'items' },
  { title: '创建时间', key: 'createdAt' },
  { title: '操作', key: 'actions', sortable: false },
]

const typeMap: Record<string, string> = { ROUTINE: '日常检查', SPECIAL: '专项检查', LICENSE: '证照检查' }
const getStatusColor = (s: string) => ({ ACTIVE: 'success', INACTIVE: 'grey' }[s] || 'grey')
const getStatusLabel = (s: string) => ({ ACTIVE: '启用', INACTIVE: '停用' }[s] || s)

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await inspectionTemplatesApi.list()
    items.value = res.items || res || []
  } catch (e) {
    console.error(e)
    alert('加载数据失败')
  }
  finally { loading.value = false }
}

const openDialog = (_item?: any) => { alert('检查模板表单 - 功能开发中') }
const viewDetail = (item: any) => { alert(`查看模板: ${item.name}`) }

onMounted(loadData)
</script>