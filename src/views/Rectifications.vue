<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-wrench</v-icon>
      整改管理
      <v-spacer />
      <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="搜索" density="compact" variant="outlined" hide-details class="me-2" style="max-width: 300px" />
      <v-btn v-if="selected.length" color="error" prepend-icon="mdi-delete-sweep" class="me-2" @click="handleBatchDelete">批量删除 ({{ selected.length }})</v-btn>
      <v-btn v-if="selected.length && selected.every((i: any) => i.status === 'SUBMITTED')" color="warning" prepend-icon="mdi-gavel" class="me-2" @click="openBatchReviewDialog">批量审核 ({{ selected.length }})</v-btn>
      <v-btn color="success" prepend-icon="mdi-file-export" variant="outlined" class="me-2" @click="exportsApi.download('rectifications')">导出</v-btn>
      <v-btn color="primary" @click="openCreateDialog">新建整改</v-btn>
    </v-card-title>
    <v-data-table v-model="selected" :headers="headers" :items="items" :loading="loading" :search="search" :return-object="true" show-select class="elevation-0">
      <template #item.status="{ item }">
        <v-chip :color="statusColorMap[item.status] || 'grey'" size="small">{{ statusLabelMap[item.status] || item.status }}</v-chip>
      </template>
      <template #item.level="{ item }">
        <v-chip :color="levelColorMap[item.level] || 'grey'" size="small" variant="outlined">{{ levelLabelMap[item.level] || item.level }}</v-chip>
      </template>
      <template #item.entity.name="{ item }">
        {{ item.entity?.name || '-' }}
      </template>
      <template #item.deadline="{ item }">
        {{ item.deadline ? formatDate(item.deadline) : '-' }}
      </template>
      <template #item.createdAt="{ item }">
        {{ formatDate(item.createdAt) }}
      </template>
      <template #item.actions="{ item }">
        <v-btn icon="mdi-eye" variant="text" size="small" @click="viewDetail(item)" />
        <v-btn v-if="item.status === 'PENDING'" icon="mdi-check" variant="text" size="small" color="success" @click="openSubmitDialog(item)" />
        <v-btn v-if="item.status === 'SUBMITTED'" icon="mdi-gavel" variant="text" size="small" color="warning" @click="openReviewDialog(item)" />
      </template>
    </v-data-table>

    <!-- 详情弹窗 -->
    <v-dialog v-model="detailDialog" max-width="600">
      <v-card>
        <v-card-title>整改详情</v-card-title>
        <v-card-text v-if="detailItem">
          <v-list density="compact">
            <v-list-item><v-list-item-title>整改编号</v-list-item-title><v-list-item-subtitle>{{ detailItem.id }}</v-list-item-subtitle></v-list-item>
            <v-list-item><v-list-item-title>经营主体</v-list-item-title><v-list-item-subtitle>{{ detailItem.entity?.name || '-' }}</v-list-item-subtitle></v-list-item>
            <v-list-item><v-list-item-title>问题描述</v-list-item-title><v-list-item-subtitle>{{ detailItem.description }}</v-list-item-subtitle></v-list-item>
            <v-list-item><v-list-item-title>整改级别</v-list-item-title><v-list-item-subtitle>{{ levelLabelMap[detailItem.level] || detailItem.level }}</v-list-item-subtitle></v-list-item>
            <v-list-item><v-list-item-title>状态</v-list-item-title><v-list-item-subtitle>{{ statusLabelMap[detailItem.status] || detailItem.status }}</v-list-item-subtitle></v-list-item>
            <v-list-item><v-list-item-title>截止日期</v-list-item-title><v-list-item-subtitle>{{ detailItem.deadline ? formatDate(detailItem.deadline) : '未设置' }}</v-list-item-subtitle></v-list-item>
            <v-list-item v-if="detailItem.submitDescription"><v-list-item-title>提交说明</v-list-item-title><v-list-item-subtitle>{{ detailItem.submitDescription }}</v-list-item-subtitle></v-list-item>
            <v-list-item v-if="detailItem.reviewResult"><v-list-item-title>审核结果</v-list-item-title><v-list-item-subtitle>{{ detailItem.reviewResult === 'APPROVED' ? '通过' : '驳回' }}</v-list-item-subtitle></v-list-item>
            <v-list-item v-if="detailItem.reviewRemark"><v-list-item-title>审核备注</v-list-item-title><v-list-item-subtitle>{{ detailItem.reviewRemark }}</v-list-item-subtitle></v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions><v-spacer /><v-btn @click="detailDialog = false">关闭</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 新建整改弹窗 -->
    <v-dialog v-model="createDialog" max-width="500">
      <v-card>
        <v-card-title>新建整改</v-card-title>
        <v-card-text>
          <v-text-field v-model="createForm.recordId" label="检查记录ID" density="compact" />
          <v-text-field v-model="createForm.entityId" label="经营主体ID" density="compact" />
          <v-textarea v-model="createForm.description" label="问题描述" density="compact" rows="3" />
          <v-text-field v-model="createForm.deadline" label="截止日期" type="date" density="compact" />
          <v-select v-model="createForm.level" :items="levelOptions" item-title="label" item-value="value" label="整改级别" density="compact" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="createDialog = false">取消</v-btn>
          <v-btn color="primary" :loading="submitting" @click="handleCreate">确认创建</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 提交整改弹窗 -->
    <v-dialog v-model="submitDialog" max-width="500">
      <v-card>
        <v-card-title>提交整改</v-card-title>
        <v-card-text>
          <v-textarea v-model="submitForm.submitDescription" label="整改说明" density="compact" rows="3" />
          <v-textarea v-model="submitForm.submitPhotos" label="整改照片(链接,逗号分隔)" density="compact" rows="2" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="submitDialog = false">取消</v-btn>
          <v-btn color="primary" :loading="submitting" @click="handleSubmit">提交</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 审核弹窗 -->
    <v-dialog v-model="reviewDialog" max-width="500">
      <v-card>
        <v-card-title>审核整改</v-card-title>
        <v-card-text>
          <v-select v-model="reviewForm.reviewResult" :items="reviewOptions" item-title="label" item-value="value" label="审核结果" density="compact" />
          <v-textarea v-model="reviewForm.reviewRemark" label="审核备注" density="compact" rows="3" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="reviewDialog = false">取消</v-btn>
          <v-btn color="primary" :loading="submitting" @click="handleReview">确认审核</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 批量审核弹窗 -->
    <v-dialog v-model="batchReviewDialog" max-width="500">
      <v-card>
        <v-card-title>批量审核 ({{ selected.length }} 条)</v-card-title>
        <v-card-text>
          <v-select v-model="batchReviewForm.result" :items="reviewOptions" item-title="label" item-value="value" label="审核结果" density="compact" />
          <v-textarea v-model="batchReviewForm.remark" label="审核备注" density="compact" rows="3" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="batchReviewDialog = false">取消</v-btn>
          <v-btn color="primary" :loading="submitting" @click="handleBatchReview">确认审核</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { rectificationsApi, exportsApi } from '../services/api'

const search = ref('')
const loading = ref(false)
const submitting = ref(false)
const items = ref<any[]>([])
const selected = ref<any[]>([])

const headers = [
  { title: '整改编号', key: 'id' },
  { title: '经营主体', key: 'entity.name' },
  { title: '问题描述', key: 'description' },
  { title: '整改级别', key: 'level' },
  { title: '状态', key: 'status' },
  { title: '截止日期', key: 'deadline' },
  { title: '创建时间', key: 'createdAt' },
  { title: '操作', key: 'actions', sortable: false },
]

const statusColorMap: Record<string, string> = { PENDING: 'warning', SUBMITTED: 'info', APPROVED: 'success', REJECTED: 'error', OVERDUE: 'error' }
const statusLabelMap: Record<string, string> = { PENDING: '待整改', SUBMITTED: '已提交', APPROVED: '已通过', REJECTED: '已驳回', OVERDUE: '已逾期' }

const levelColorMap: Record<string, string> = { LOW: 'success', MEDIUM: 'warning', HIGH: 'error' }
const levelLabelMap: Record<string, string> = { LOW: '低', MEDIUM: '中', HIGH: '高' }
const levelOptions = [
  { label: '低', value: 'LOW' },
  { label: '中', value: 'MEDIUM' },
  { label: '高', value: 'HIGH' },
]
const reviewOptions = [
  { label: '通过', value: 'APPROVED' },
  { label: '驳回', value: 'REJECTED' },
]

const formatDate = (d: string) => new Date(d).toLocaleString('zh-CN')

// 详情弹窗
const detailDialog = ref(false)
const detailItem = ref<any>(null)
const viewDetail = (item: any) => { detailItem.value = item; detailDialog.value = true }

// 新建弹窗
const createDialog = ref(false)
const createForm = ref({ recordId: '', entityId: '', description: '', deadline: '', level: 'LOW' })
const openCreateDialog = () => { createForm.value = { recordId: '', entityId: '', description: '', deadline: '', level: 'LOW' }; createDialog.value = true }
const handleCreate = async () => {
  submitting.value = true
  try {
    const res: any = await rectificationsApi.create({
      ...createForm.value,
      deadline: createForm.value.deadline || null,
    })
    items.value.unshift(res)
    createDialog.value = false
  } catch (e) { console.error(e); alert('创建失败') }
  finally { submitting.value = false }
}

// 提交整改弹窗
const submitDialog = ref(false)
const submitForm = ref({ submitDescription: '', submitPhotos: '' })
const currentSubmitItem = ref<any>(null)
const openSubmitDialog = (item: any) => {
  currentSubmitItem.value = item
  submitForm.value = { submitDescription: '', submitPhotos: '' }
  submitDialog.value = true
}
const handleSubmit = async () => {
  submitting.value = true
  try {
    const res: any = await rectificationsApi.submit(currentSubmitItem.value.id, submitForm.value)
    const idx = items.value.findIndex((i: any) => i.id === currentSubmitItem.value.id)
    if (idx >= 0) items.value[idx] = res
    submitDialog.value = false
  } catch (e) { console.error(e); alert('提交失败') }
  finally { submitting.value = false }
}

// 审核弹窗
const reviewDialog = ref(false)
const reviewForm = ref({ reviewResult: '', reviewRemark: '' })
const currentReviewItem = ref<any>(null)
const openReviewDialog = (item: any) => {
  currentReviewItem.value = item
  reviewForm.value = { reviewResult: '', reviewRemark: '' }
  reviewDialog.value = true
}
const handleReview = async () => {
  submitting.value = true
  try {
    const res: any = await rectificationsApi.review(currentReviewItem.value.id, reviewForm.value)
    const idx = items.value.findIndex((i: any) => i.id === currentReviewItem.value.id)
    if (idx >= 0) items.value[idx] = res
    reviewDialog.value = false
  } catch (e) { console.error(e); alert('审核失败') }
  finally { submitting.value = false }
}

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await rectificationsApi.list()
    items.value = res.items || res || []
  } catch (e) { console.error(e); alert('加载数据失败') }
  finally { loading.value = false }
}

const handleBatchDelete = async () => {
  if (!selected.value.length) return
  if (!confirm(`确定删除 ${selected.value.length} 条整改记录？此操作不可撤销`)) return
  try {
    await rectificationsApi.batchDelete(selected.value.map((i: any) => i.id))
    alert(`成功删除 ${selected.value.length} 条整改记录`)
    selected.value = []
    loadData()
  } catch (e: any) { alert('批量删除失败: ' + (e?.response?.data?.message || e?.message)) }
}

// 批量审核弹窗
const batchReviewDialog = ref(false)
const batchReviewForm = ref({ result: '', remark: '' })
const openBatchReviewDialog = () => {
  batchReviewForm.value = { result: '', remark: '' }
  batchReviewDialog.value = true
}
const handleBatchReview = async () => {
  submitting.value = true
  try {
    await rectificationsApi.batchReview(selected.value.map((i: any) => i.id), batchReviewForm.value.result, batchReviewForm.value.remark)
    alert(`成功审核 ${selected.value.length} 条整改记录`)
    selected.value = []
    batchReviewDialog.value = false
    loadData()
  } catch (e: any) { alert('批量审核失败: ' + (e?.response?.data?.message || e?.message)) }
  finally { submitting.value = false }
}

onMounted(loadData)
</script>
