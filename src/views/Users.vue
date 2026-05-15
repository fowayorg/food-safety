<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-account-group</v-icon>
      用户管理
      <v-spacer />
      <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="搜索" density="compact" variant="outlined" hide-details class="me-2" style="max-width: 300px" />
      <v-btn v-if="selected.length" color="error" prepend-icon="mdi-delete-sweep" class="me-2" @click="handleBatchDelete">批量删除 ({{ selected.length }})</v-btn>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">新增用户</v-btn>
    </v-card-title>
    <v-data-table v-model="selected" :headers="headers" :items="items" :loading="loading" :search="search" :return-object="true" show-select class="elevation-0">
      <template #item.role="{ item }">
        <v-chip :color="getRoleColor(item.role)" size="small">{{ roleMap[item.role] || item.role }}</v-chip>
      </template>
      <template #item.status="{ item }">
        <v-chip :color="item.status === 'ACTIVE' ? 'success' : 'error'" size="small">{{ item.status === 'ACTIVE' ? '正常' : '禁用' }}</v-chip>
      </template>
      <template #item.actions="{ item }">
        <v-btn icon="mdi-pencil" variant="text" size="small" @click="openDialog(item)" />
        <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="handleDelete(item)" />
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usersApi } from '../services/api'

const search = ref('')
const loading = ref(false)
const items = ref<any[]>([])
const selected = ref<any[]>([])

const headers = [
  { title: '用户名', key: 'username' },
  { title: '姓名', key: 'realName' },
  { title: '角色', key: 'role' },
  { title: '所属街道', key: 'street.name' },
  { title: '状态', key: 'status' },
  { title: '最后登录', key: 'lastLoginAt' },
  { title: '操作', key: 'actions', sortable: false },
]

const roleMap: Record<string, string> = { SUPER_ADMIN: '超级管理员', ADMIN: '管理员', STREET_ADMIN: '街道管理员', INSPECTOR: '检查员', LEGAL_PERSON: '法人', SHOPKEEPER: '店主' }
const getRoleColor = (role: string) => ({ SUPER_ADMIN: 'purple', ADMIN: 'primary', STREET_ADMIN: 'info', INSPECTOR: 'success', LEGAL_PERSON: 'warning', SHOPKEEPER: 'grey' }[role] || 'grey')

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await usersApi.list()
    items.value = res.items || res || []
  } catch (e) {
    console.error(e)
    alert('加载数据失败')
  }
  finally { loading.value = false }
}

const openDialog = (_item?: any) => { alert('用户表单 - 功能开发中') }

const handleDelete = async (item: any) => {
  if (!confirm('确定删除此用户？')) return
  try {
    await usersApi.delete(item.id)
    loadData()
  } catch (e: any) {
    alert(e?.message || '删除失败')
  }
}

const handleBatchDelete = async () => {
  if (!selected.value.length) return
  if (!confirm(`确定删除 ${selected.value.length} 个用户？此操作不可撤销`)) return
  try {
    await usersApi.batchDelete(selected.value.map((i: any) => i.id))
    alert(`成功删除 ${selected.value.length} 个用户`)
    selected.value = []
    loadData()
  } catch (e: any) { alert('批量删除失败: ' + (e?.response?.data?.message || e?.message)) }
}

onMounted(loadData)
</script>