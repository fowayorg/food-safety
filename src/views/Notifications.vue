<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-bell</v-icon>
      消息通知管理
      <v-spacer />
      <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="搜索" density="compact" variant="outlined" hide-details class="me-2" style="max-width: 300px" />
      <v-btn v-if="selected.length" color="error" prepend-icon="mdi-delete-sweep" class="me-2" @click="handleBatchDelete">批量删除 ({{ selected.length }})</v-btn>
      <v-btn v-if="selected.length" variant="tonal" prepend-icon="mdi-email-open-outline" class="me-2" @click="handleBatchRead">批量已读 ({{ selected.length }})</v-btn>
      <v-btn variant="tonal" prepend-icon="mdi-email-open-all" class="me-2" @click="handleReadAll">全部已读</v-btn>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openSendDialog">发送通知</v-btn>
    </v-card-title>

    <!-- 筛选栏 -->
    <v-card-text class="pb-0">
      <v-row dense>
        <v-col cols="3">
          <v-select v-model="filterType" :items="typeFilterOptions" item-title="label" item-value="value" label="通知类型" density="compact" variant="outlined" clearable hide-details />
        </v-col>
        <v-col cols="3">
          <v-select v-model="filterRead" :items="readFilterOptions" item-title="label" item-value="value" label="已读状态" density="compact" variant="outlined" clearable hide-details />
        </v-col>
      </v-row>
    </v-card-text>

    <v-data-table v-model="selected" :headers="headers" :items="items" :loading="loading" :search="search" :return-object="true" show-select class="elevation-0">
      <template #item.type="{ item }">
        <v-chip :color="typeColorMap[item.type] || 'info'" size="small">{{ typeLabelMap[item.type] || item.type }}</v-chip>
      </template>
      <template #item.isRead="{ item }">
        <v-chip :color="item.isRead ? 'grey' : 'success'" size="small" @click="!item.isRead && markRead(item)" style="cursor:pointer">
          {{ item.isRead ? '已读' : '未读' }}
        </v-chip>
      </template>
      <template #item.createdAt="{ item }">
        {{ formatDate(item.createdAt) }}
      </template>
      <template #item.actions="{ item }">
        <v-btn icon="mdi-eye" variant="text" size="small" @click="viewDetail(item)" />
        <v-btn v-if="!item.isRead" icon="mdi-email-open-outline" variant="text" size="small" color="success" @click="markRead(item)" />
        <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="handleDelete(item)" />
      </template>
    </v-data-table>
  </v-card>

  <!-- 详情弹窗 -->
  <v-dialog v-model="detailDialog" max-width="600">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-chip :color="typeColorMap[detailItem?.type] || 'info'" size="small" class="me-2">{{ typeLabelMap[detailItem?.type] || detailItem?.type }}</v-chip>
        {{ detailItem?.title }}
      </v-card-title>
      <v-card-text v-if="detailItem">
        <v-list density="compact">
          <v-list-item><v-list-item-title>接收人</v-list-item-title><v-list-item-subtitle>{{ detailItem.user?.realName || '-' }}</v-list-item-subtitle></v-list-item>
          <v-list-item><v-list-item-title>通知内容</v-list-item-title><v-list-item-subtitle>{{ detailItem.content || '无内容' }}</v-list-item-subtitle></v-list-item>
          <v-list-item><v-list-item-title>关联类型</v-list-item-title><v-list-item-subtitle>{{ detailItem.relatedType || '-' }}</v-list-item-subtitle></v-list-item>
          <v-list-item><v-list-item-title>关联ID</v-list-item-title><v-list-item-subtitle>{{ detailItem.relatedId || '-' }}</v-list-item-subtitle></v-list-item>
          <v-list-item><v-list-item-title>状态</v-list-item-title><v-list-item-subtitle>{{ detailItem.isRead ? '已读' : '未读' }}{{ detailItem.readAt ? ' (' + formatDate(detailItem.readAt) + ')' : '' }}</v-list-item-subtitle></v-list-item>
          <v-list-item><v-list-item-title>发送时间</v-list-item-title><v-list-item-subtitle>{{ formatDate(detailItem.createdAt) }}</v-list-item-subtitle></v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn v-if="!detailItem?.isRead" color="success" variant="tonal" @click="markRead(detailItem); detailDialog = false">标记已读</v-btn>
        <v-btn @click="detailDialog = false">关闭</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 发送通知弹窗 -->
  <v-dialog v-model="sendDialog" max-width="500">
    <v-card>
      <v-card-title>发送通知</v-card-title>
      <v-card-text>
        <v-select v-model="sendForm.userId" :items="userOptions" item-title="realName" item-value="id" label="接收人" density="compact" variant="outlined" class="mb-2" />
        <v-select v-model="sendForm.type" :items="typeSendOptions" item-title="label" item-value="value" label="通知类型" density="compact" variant="outlined" class="mb-2" />
        <v-text-field v-model="sendForm.title" label="通知标题" density="compact" variant="outlined" class="mb-2" />
        <v-textarea v-model="sendForm.content" label="通知内容" density="compact" variant="outlined" rows="3" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="sendDialog = false">取消</v-btn>
        <v-btn color="primary" :loading="sending" @click="handleSend">发送</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { notificationsApi, usersApi } from '../services/api'

const search = ref('')
const loading = ref(false)
const sending = ref(false)
const items = ref<any[]>([])
const selected = ref<any[]>([])
const filterType = ref<string | null>(null)
const filterRead = ref<boolean | null>(null)

// 用户列表（发送通知用）
const userOptions = ref<any[]>([])

// 详情弹窗
const detailDialog = ref(false)
const detailItem = ref<any>(null)

// 发送弹窗
const sendDialog = ref(false)
const sendForm = ref({ userId: '', type: 'SYSTEM', title: '', content: '' })

const headers = [
  { title: '通知标题', key: 'title' },
  { title: '通知类型', key: 'type' },
  { title: '接收人', key: 'user.realName' },
  { title: '状态', key: 'isRead' },
  { title: '发送时间', key: 'createdAt' },
  { title: '操作', key: 'actions', sortable: false },
]

const typeColorMap: Record<string, string> = { INSPECTION: 'primary', RECTIFICATION: 'warning', COMPLAINT: 'error', ACTIVITY: 'success', SYSTEM: 'grey' }
const typeLabelMap: Record<string, string> = { INSPECTION: '检查通知', RECTIFICATION: '整改通知', COMPLAINT: '投诉通知', ACTIVITY: '活动通知', SYSTEM: '系统通知' }

const typeFilterOptions = [
  { label: '检查通知', value: 'INSPECTION' },
  { label: '整改通知', value: 'RECTIFICATION' },
  { label: '投诉通知', value: 'COMPLAINT' },
  { label: '活动通知', value: 'ACTIVITY' },
  { label: '系统通知', value: 'SYSTEM' },
]

const typeSendOptions = [
  { label: '检查通知', value: 'INSPECTION' },
  { label: '整改通知', value: 'RECTIFICATION' },
  { label: '投诉通知', value: 'COMPLAINT' },
  { label: '活动通知', value: 'ACTIVITY' },
  { label: '系统通知', value: 'SYSTEM' },
]

const readFilterOptions = [
  { label: '未读', value: false },
  { label: '已读', value: true },
]

const formatDate = (d: string) => d ? new Date(d).toLocaleString('zh-CN') : '-'

const loadData = async () => {
  loading.value = true
  try {
    const params: any = { page: 1, pageSize: 100 }
    if (filterType.value) params.type = filterType.value
    if (filterRead.value !== null) params.isRead = String(filterRead.value)
    const res: any = await notificationsApi.list(params)
    items.value = res.items || res || []
  } catch (e) {
    console.error(e)
    alert('加载数据失败')
  }
  finally { loading.value = false }
}

const loadUsers = async () => {
  try {
    const res: any = await usersApi.list()
    userOptions.value = res.items || res || []
  } catch (e) { console.error(e) }
}

const viewDetail = async (item: any) => {
  detailItem.value = item
  detailDialog.value = true
  // 自动标记已读
  if (!item.isRead) markRead(item)
}

const markRead = async (item: any) => {
  try {
    await notificationsApi.markRead(item.id)
    item.isRead = true
    item.readAt = new Date().toISOString()
  } catch (e) { console.error(e) }
}

const handleDelete = async (item: any) => {
  if (!confirm('确定删除此通知？')) return
  try {
    await notificationsApi.delete(item.id)
    loadData()
  } catch (e: any) { alert(e?.message || '删除失败') }
}

const handleReadAll = async () => {
  if (!confirm('确定将所有通知标记为已读？')) return
  try {
    await notificationsApi.markAllRead()
    loadData()
  } catch (e: any) { alert('操作失败: ' + (e?.message || '')) }
}

const handleBatchRead = async () => {
  if (!selected.value.length) return
  try {
    await notificationsApi.batchRead(selected.value.map((i: any) => i.id))
    selected.value = []
    loadData()
  } catch (e: any) { alert('批量已读失败: ' + (e?.message || '')) }
}

const handleBatchDelete = async () => {
  if (!selected.value.length) return
  if (!confirm(`确定删除 ${selected.value.length} 条通知？`)) return
  try {
    await notificationsApi.batchDelete(selected.value.map((i: any) => i.id))
    selected.value = []
    loadData()
  } catch (e: any) { alert('批量删除失败: ' + (e?.message || '')) }
}

const openSendDialog = () => {
  sendForm.value = { userId: '', type: 'SYSTEM', title: '', content: '' }
  sendDialog.value = true
}

const handleSend = async () => {
  if (!sendForm.value.userId || !sendForm.value.title) {
    alert('请填写接收人和通知标题')
    return
  }
  sending.value = true
  try {
    await notificationsApi.create(sendForm.value)
    sendDialog.value = false
    loadData()
  } catch (e: any) { alert('发送失败: ' + (e?.message || '')) }
  finally { sending.value = false }
}

watch([filterType, filterRead], () => { loadData() })

onMounted(() => { loadData(); loadUsers() })
</script>
