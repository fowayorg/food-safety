<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-map-marker</v-icon>
      街道管理
      <v-spacer />
      <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="搜索" density="compact" variant="outlined" hide-details class="me-2" style="max-width: 300px" />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">新增街道</v-btn>
    </v-card-title>
    <v-data-table :headers="headers" :items="items" :loading="loading" :search="search" class="elevation-0">
      <template #item.actions="{ item }">
        <v-btn icon="mdi-pencil" variant="text" size="small" @click="openDialog(item)" />
        <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="handleDelete(item)" />
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { streetsApi } from '../services/api'

const search = ref('')
const loading = ref(false)
const items = ref<any[]>([])

const headers = [
  { title: '街道名称', key: 'name' },
  { title: '街道代码', key: 'code' },
  { title: '负责人', key: 'contactPerson' },
  { title: '联系电话', key: 'contactPhone' },
  { title: '操作', key: 'actions', sortable: false },
]

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await streetsApi.list()
    items.value = res.items || res || []
  } catch (e) {
    console.error(e)
    alert('加载数据失败')
  }
  finally { loading.value = false }
}

const openDialog = (_item?: any) => { alert('街道表单 - 功能开发中') }

const handleDelete = async (item: any) => {
  if (!confirm('确定删除此街道？')) return
  try {
    await streetsApi.delete(item.id)
    loadData()
  } catch (e: any) {
    alert(e?.message || '删除失败')
  }
}

onMounted(loadData)
</script>