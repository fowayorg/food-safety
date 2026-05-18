<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-account-group</v-icon>
      社会共治活动
      <v-spacer />
      <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="搜索" density="compact" variant="outlined" hide-details class="me-2" style="max-width: 300px" />
      <v-btn color="success" prepend-icon="mdi-file-export" variant="outlined" class="me-2" @click="exportsApi.download('activities')">导出</v-btn>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">新增活动</v-btn>
    </v-card-title>
    <v-data-table :headers="headers" :items="items" :loading="loading" :search="search" class="elevation-0">
      <template #item.name="{ item }">
        <div class="font-weight-medium">{{ item.name }}</div>
        <div class="text-caption text-grey">{{ item.description?.slice(0, 40) }}{{ item.description?.length > 40 ? '...' : '' }}</div>
      </template>
      <template #item.type="{ item }">
        <v-chip size="small" :color="typeColorMap[item.type]">{{ typeLabelMap[item.type] || item.type }}</v-chip>
      </template>
      <template #item.participants="{ item }">
        <span>{{ item._count?.participants ?? 0 }}</span>
      </template>
      <template #item.status="{ item }">
        <v-chip :color="statusColorMap[item.status] || 'grey'" size="small">{{ statusLabelMap[item.status] || item.status }}</v-chip>
      </template>
      <template #item.startDate="{ item }">
        {{ item.startDate ? formatDate(item.startDate) : '-' }}
      </template>
      <template #item.actions="{ item }">
        <v-btn icon="mdi-eye" variant="text" size="small" @click="viewDetail(item)" />
        <v-btn icon="mdi-pencil" variant="text" size="small" @click="openDialog(item)" />
        <v-btn v-if="item.status === 'DRAFT'" icon="mdi-send" variant="text" size="small" color="success" title="发布" @click="handlePublish(item)" />
        <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="handleDelete(item)" />
      </template>
    </v-data-table>
  </v-card>

  <!-- 创建/编辑对话框 -->
  <v-dialog v-model="dialog" max-width="700">
    <v-card>
      <v-card-title>{{ form.id ? '编辑活动' : '新建活动' }}</v-card-title>
      <v-card-text>
        <v-form ref="formRef">
          <v-text-field v-model="form.name" label="活动名称" variant="outlined" class="mb-2" :rules="[v => !!v || '请输入活动名称']" />
          <v-select v-model="form.type" :items="typeOptions" label="活动类型" variant="outlined" class="mb-2" :rules="[v => !!v || '请选择活动类型']" />
          <v-textarea v-model="form.description" label="活动描述" variant="outlined" rows="3" class="mb-2" />
          <v-row>
            <v-col cols="6">
              <v-text-field v-model="form.startDate" label="开始日期" type="date" variant="outlined" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="form.endDate" label="结束日期" type="date" variant="outlined" />
            </v-col>
          </v-row>
          <v-select v-model="form.targetAudience" :items="audienceOptions" label="目标受众" variant="outlined" class="mb-2" />

          <!-- 投票类型配置 -->
          <div v-if="form.type === 'VOTE'" class="mt-2">
            <div class="text-subtitle-2 mb-2">投票选项</div>
            <div v-for="(opt, i) in voteOptions" :key="i" class="d-flex align-center mb-2">
              <v-text-field v-model="voteOptions[i]" density="compact" variant="outlined" :label="`选项 ${i + 1}`" hide-details class="flex-grow-1" />
              <v-btn icon="mdi-close" variant="text" size="small" color="error" class="ml-1" @click="voteOptions.splice(i, 1)" />
            </div>
            <v-btn size="small" prepend-icon="mdi-plus" variant="tonal" @click="voteOptions.push('')">添加选项</v-btn>
          </div>

          <!-- 建议类型配置 -->
          <div v-if="form.type === 'SUGGESTION'" class="mt-2">
            <v-switch v-model="form.config.allowAnonymous" label="允许匿名提交" color="primary" hide-details density="compact" />
            <v-text-field v-model.number="form.config.maxSubmissions" type="number" label="每人最大提交次数" variant="outlined" density="compact" />
          </div>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialog = false">取消</v-btn>
        <v-btn color="primary" @click="handleSave">保存</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 详情对话框 -->
  <v-dialog v-model="detailDialog" max-width="700">
    <v-card>
      <v-card-title>{{ detailItem?.name }}</v-card-title>
      <v-card-subtitle>
        <v-chip size="small" :color="typeColorMap[detailItem?.type]" class="mr-2">{{ typeLabelMap[detailItem?.type] }}</v-chip>
        <v-chip size="small" :color="statusColorMap[detailItem?.status]">{{ statusLabelMap[detailItem?.status] }}</v-chip>
      </v-card-subtitle>
      <v-card-text>
        <v-list density="compact">
          <v-list-item prepend-icon="mdi-text">描述: {{ detailItem?.description || '无' }}</v-list-item>
          <v-list-item prepend-icon="mdi-calendar">时间: {{ detailItem?.startDate ? formatDate(detailItem.startDate) : '-' }} ~ {{ detailItem?.endDate ? formatDate(detailItem.endDate) : '无' }}</v-list-item>
          <v-list-item prepend-icon="mdi-account-multiple">参与人数: {{ detailItem?._count?.participants ?? 0 }}</v-list-item>
          <v-list-item prepend-icon="mdi-account">目标受众: {{ audienceLabelMap[detailItem?.targetAudience] || detailItem?.targetAudience || '全部' }}</v-list-item>
          <v-list-item prepend-icon="mdi-account-circle">创建者: {{ detailItem?.creator?.realName || detailItem?.creator?.username || '-' }}</v-list-item>
        </v-list>
        <div v-if="detailItem?.participants?.length" class="mt-3">
          <div class="text-subtitle-2 mb-1">参与名单</div>
          <v-table density="compact" class="border">
            <thead><tr><th>姓名</th><th>联系方式</th><th>内容</th><th>时间</th></tr></thead>
            <tbody>
              <tr v-for="p in detailItem.participants" :key="p.id">
                <td>{{ p.participantName || '匿名' }}</td>
                <td>{{ p.participantPhone || '-' }}</td>
                <td>{{ p.content || '-' }}</td>
                <td>{{ p.createdAt ? formatDate(p.createdAt) : '-' }}</td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="detailDialog = false">关闭</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { activitiesApi, exportsApi } from '../services/api'

const search = ref('')
const loading = ref(false)
const items = ref<any[]>([])
const dialog = ref(false)
const detailDialog = ref(false)
const detailItem = ref<any>(null)
const formRef = ref()
const voteOptions = ref<string[]>(['', ''])

const form = ref<any>({
  id: null as string | null,
  name: '',
  type: '',
  description: '',
  startDate: '',
  endDate: '',
  targetAudience: 'ALL',
  config: { allowAnonymous: false, maxSubmissions: 3 },
})

const typeOptions = [
  { title: '投票活动', value: 'VOTE' },
  { title: '意见建议', value: 'SUGGESTION' },
  { title: '促销活动', value: 'PROMOTION' },
  { title: '问卷调查', value: 'SURVEY' },
]
const typeLabelMap: Record<string, string> = { VOTE: '投票活动', SUGGESTION: '意见建议', PROMOTION: '促销活动', SURVEY: '问卷调查' }
const typeColorMap: Record<string, string> = { VOTE: 'blue', SUGGESTION: 'green', PROMOTION: 'orange', SURVEY: 'purple' }

const audienceOptions = [
  { title: '全部', value: 'ALL' },
  { title: '经营者', value: 'OPERATOR' },
  { title: '消费者', value: 'CONSUMER' },
]
const audienceLabelMap: Record<string, string> = { ALL: '全部', OPERATOR: '经营者', CONSUMER: '消费者' }

const statusColorMap: Record<string, string> = { DRAFT: 'warning', PUBLISHED: 'info', ACTIVE: 'success', ENDED: 'grey', CANCELLED: 'error' }
const statusLabelMap: Record<string, string> = { DRAFT: '草稿', PUBLISHED: '已发布', ACTIVE: '进行中', ENDED: '已结束', CANCELLED: '已取消' }

const headers = [
  { title: '活动名称', key: 'name' },
  { title: '活动类型', key: 'type' },
  { title: '参与人数', key: 'participants' },
  { title: '状态', key: 'status' },
  { title: '开始时间', key: 'startDate' },
  { title: '操作', key: 'actions', sortable: false },
]

const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('zh-CN') : ''

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await activitiesApi.list()
    items.value = res.items || res || []
  } catch (e) { console.error(e); alert('加载数据失败') }
  finally { loading.value = false }
}

const loadDetail = async (id: string) => {
  const res: any = await activitiesApi.get(Number(id))
  detailItem.value = res
  detailDialog.value = true
}

const openDialog = (_item?: any) => {
  if (_item) {
    form.value = {
      id: _item.id,
      name: _item.name,
      type: _item.type,
      description: _item.description,
      startDate: _item.startDate?.slice(0, 10),
      endDate: _item.endDate?.slice(0, 10),
      targetAudience: _item.targetAudience || 'ALL',
      config: typeof _item.config === 'string' ? JSON.parse(_item.config) : (_item.config || {}),
    }
    if (_item.type === 'VOTE' && form.value.config?.options) {
      voteOptions.value = [...form.value.config.options]
    } else {
      voteOptions.value = ['', '']
    }
  } else {
    form.value = { id: null, name: '', type: 'VOTE', description: '', startDate: '', endDate: '', targetAudience: 'ALL', config: { allowAnonymous: false, maxSubmissions: 3 } }
    voteOptions.value = ['', '']
  }
  dialog.value = true
}

const viewDetail = async (item: any) => { await loadDetail(item.id) }

const handleSave = async () => {
  try {
    const data: any = {
      name: form.value.name,
      type: form.value.type,
      description: form.value.description,
      startDate: form.value.startDate || undefined,
      endDate: form.value.endDate || undefined,
      targetAudience: form.value.targetAudience,
    }
    if (form.value.type === 'VOTE') {
      data.config = JSON.stringify({ options: voteOptions.value.filter(o => o.trim()) })
    } else if (form.value.type === 'SUGGESTION') {
      data.config = JSON.stringify({ allowAnonymous: form.value.config?.allowAnonymous, maxSubmissions: form.value.config?.maxSubmissions })
    }
    if (form.value.id) {
      await activitiesApi.update(form.value.id, data)
    } else {
      await activitiesApi.create(data)
    }
    dialog.value = false
    loadData()
  } catch (e: any) { alert(e?.response?.data?.message || e?.message || '保存失败') }
}

const handlePublish = async (item: any) => {
  if (!confirm(`确定发布活动「${item.name}」吗？`)) return
  try {
    await activitiesApi.publish(item.id)
    loadData()
  } catch (e: any) { alert(e?.response?.data?.message || e?.message || '发布失败') }
}

const handleDelete = async (item: any) => {
  if (!confirm(`确定删除活动「${item.name}」吗？`)) return
  if (!confirm('此操作不可撤销，继续吗？')) return
  try {
    await activitiesApi.delete(item.id)
    loadData()
  } catch (e: any) { alert(e?.response?.data?.message || e?.message || '删除失败') }
}

onMounted(loadData)
</script>
