<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-clipboard-check</v-icon>
      监督检查管理
      <v-spacer />
      <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="搜索" density="compact" variant="outlined" hide-details class="me-2" style="max-width: 300px" />
      <v-btn v-if="selected.length" color="error" prepend-icon="mdi-delete-sweep" class="me-2" @click="handleBatchDelete">批量删除 ({{ selected.length }})</v-btn>
      <v-btn color="success" prepend-icon="mdi-file-export" variant="outlined" class="me-2" @click="exportsApi.download('inspections')">导出</v-btn>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">新增检查</v-btn>
    </v-card-title>
    <v-data-table v-model="selected" :headers="headers" :items="items" :loading="loading" :search="search" :return-object="true" show-select class="elevation-0">
      <template #item.result="{ item }">
        <v-chip :color="getResultColor(item.result)" size="small">{{ getResultLabel(item.result) }}</v-chip>
      </template>
      <template #item.actions="{ item }">
        <v-btn icon="mdi-eye" variant="text" size="small" @click="viewDetail(item)" />
        <v-btn icon="mdi-pencil" variant="text" size="small" @click="openDialog(item)" />
        <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="handleDelete(item)" />
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { inspectionsApi, exportsApi } from '../services/api'

const search = ref('')
const loading = ref(false)
const items = ref<any[]>([])
const selected = ref<any[]>([])

const headers = [
  { title: '检查编号', key: 'id' },
  { title: '经营主体', key: 'task.entity.name' },
  { title: '检查人员', key: 'task.inspector.username' },
  { title: '检查结果', key: 'result' },
  { title: '得分', key: 'totalScore' },
  { title: '检查时间', key: 'inspectedAt' },
  { title: '操作', key: 'actions', sortable: false },
]

const getResultColor = (result: string) => ({ PASS: 'success', ISSUE: 'warning', FAIL: 'error' }[result] || 'grey')
const getResultLabel = (result: string) => ({ PASS: '合格', ISSUE: '基本合格', FAIL: '不合格' }[result] || '未知')

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await inspectionsApi.list()
    items.value = res.items || res || []
  } catch (e) {
    console.error(e)
    alert('加载数据失败')
  }
  finally { loading.value = false }
}

const openDialog = (_item?: any) => { alert('检查表单 - 功能开发中') }
const viewDetail = (item: any) => { alert(`查看检查详情: ${item.id}`) }

const handleDelete = async (item: any) => {
  if (!confirm('确定删除此检查记录？')) return
  try {
    await inspectionsApi.delete(item.id)
    loadData()
  } catch (e: any) { alert(e?.message || '删除失败') }
}

const handleBatchDelete = async () => {
  if (!selected.value.length) return
  if (!confirm(`确定删除 ${selected.value.length} 条检查记录？此操作不可撤销`)) return
  try {
    await inspectionsApi.batchDelete(selected.value.map((i: any) => i.id))
    alert(`成功删除 ${selected.value.length} 条检查记录`)
    selected.value = []
    loadData()
  } catch (e: any) { alert('批量删除失败: ' + (e?.response?.data?.message || e?.message)) }
}

onMounted(loadData)
</script>