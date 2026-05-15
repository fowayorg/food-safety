<template>
  <div class="qr-scans-page">
    <!-- 统计卡片 -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card color="primary" variant="tonal">
          <v-card-text class="text-center py-4">
            <div class="text-h4 font-weight-bold">{{ stats.totalScans || 0 }}</div>
            <div class="text-body-2 text-medium-emphasis">总扫码次数</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="success" variant="tonal">
          <v-card-text class="text-center py-4">
            <div class="text-h4 font-weight-bold">{{ stats.actionBreakdown?.view || 0 }}</div>
            <div class="text-body-2 text-medium-emphasis">查看</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="warning" variant="tonal">
          <v-card-text class="text-center py-4">
            <div class="text-h4 font-weight-bold">{{ stats.actionBreakdown?.verify || 0 }}</div>
            <div class="text-body-2 text-medium-emphasis">核销</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="error" variant="tonal">
          <v-card-text class="text-center py-4">
            <div class="text-h4 font-weight-bold">{{ stats.actionBreakdown?.report || 0 }}</div>
            <div class="text-body-2 text-medium-emphasis">举报</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 筛选栏 -->
    <v-card class="mb-4 pa-4">
      <v-row align="center">
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filters.scannerType"
            :items="scannerTypeOptions"
            label="扫码人类型"
            clearable
            density="compact"
            hide-details
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filters.action"
            :items="actionOptions"
            label="操作类型"
            clearable
            density="compact"
            hide-details
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-btn color="primary" variant="flat" @click="loadData" :loading="loading" block>
            <v-icon start>mdi-magnify</v-icon> 查询
          </v-btn>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-btn variant="outlined" @click="resetFilters" block>
            <v-icon start>mdi-refresh</v-icon> 重置
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- 数据表格 -->
    <v-card>
      <v-data-table-server
        :headers="headers"
        :items="records"
        :items-length="totalItems"
        :loading="loading"
        :page="currentPage"
        :items-per-page="pageSize"
        :items-per-page-options="[10, 20, 50]"
        @update:options="onUpdateOptions"
      >
        <!-- 操作类型 -->
        <template v-slot:item.action="{ item }">
          <v-chip :color="getActionColor(item.action)" size="small" label>
            {{ getActionLabel(item.action) }}
          </v-chip>
        </template>

        <!-- 扫码人类型 -->
        <template v-slot:item.scannerType="{ item }">
          {{ getScannerTypeLabel(item.scannerType) }}
        </template>

        <!-- 经营主体 -->
        <template v-slot:item.entity="{ item }">
          {{ item.entity?.name || '-' }}
        </template>

        <!-- 二维码 -->
        <template v-slot:item.qrcode="{ item }">
          <code>{{ item.qrcode?.code || '-' }}</code>
        </template>

        <!-- 时间 -->
        <template v-slot:item.createdAt="{ item }">
          {{ formatTime(item.createdAt) }}
        </template>

        <!-- 操作列 -->
        <template v-slot:item.actions="{ item }">
          <v-btn icon="mdi-eye" size="small" variant="text" @click="showDetail(item)" title="查看详情" />
          <v-btn icon="mdi-check-decagram" size="small" variant="text" color="warning" @click="openVerify(item)" title="核销" />
        </template>
      </v-data-table-server>
    </v-card>

    <!-- 详情弹窗 -->
    <v-dialog v-model="detailDialog" max-width="560">
      <v-card title="扫码记录详情">
        <v-card-text v-if="selectedRecord">
          <v-list density="compact">
            <v-list-item title="二维码编号" :subtitle="selectedRecord.qrcode?.code || '-'" />
            <v-list-item title="经营主体" :subtitle="selectedRecord.entity?.name || selectedRecord.entityName || '-'" />
            <v-list-item title="操作类型" :subtitle="getActionLabel(selectedRecord.action)" />
            <v-list-item title="扫码人类型" :subtitle="getScannerTypeLabel(selectedRecord.scannerType)" />
            <v-list-item title="扫码人姓名" :subtitle="selectedRecord.scannerName || '未登录/匿名'" />
            <v-list-item title="位置信息" :subtitle="selectedRecord.location || (selectedRecord.latitude ? `${selectedRecord.latitude}, ${selectedRecord.longitude}` : '无')" />
            <v-list-item title="备注" :subtitle="selectedRecord.remark || '无'" />
            <v-list-item title="扫码时间" :subtitle="formatTime(selectedRecord.createdAt)" />
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="detailDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 核销弹窗 -->
    <v-dialog v-model="verifyDialog" max-width="480">
      <v-card title="核销核验">
        <v-card-text>
          <v-alert type="info" variant="tonal" class="mb-4" density="compact">
            二维码：<code>{{ verifyTarget?.qrcode?.code }}</code>（经营主体：{{ verifyTarget?.entity?.name }}）
          </v-alert>
          <v-textarea v-model="verifyForm.remark" label="备注" rows="2" hide-details class="mb-3" />
          <v-text-field v-model="verifyForm.location" label="核销地点" hide-details />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="verifyDialog = false">取消</v-btn>
          <v-btn color="warning" @click="doVerify" :loading="verifyLoading">确认核销</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { qrScansApi, qrcodesApi } from '../services/api'

const loading = ref(false)
const records = ref([])
const totalItems = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const stats = ref({})
const detailDialog = ref(false)
const selectedRecord = ref(null)
const verifyDialog = ref(false)
const verifyTarget = ref(null)
const verifyLoading = ref(false)
const verifyForm = reactive({
  remark: '',
  location: '',
})

const filters = reactive({
  scannerType: null,
  action: null,
})

const headers = [
  { title: '二维码', key: 'qrcode', sortable: false },
  { title: '经营主体', key: 'entity', sortable: false },
  { title: '操作类型', key: 'action' },
  { title: '扫码人类型', key: 'scannerType' },
  { title: '扫码人姓名', key: 'scannerName' },
  { title: '位置', key: 'location' },
  { title: '扫码时间', key: 'createdAt' },
  { title: '操作', key: 'actions', sortable: false, width: 120 },
]

const scannerTypeOptions = [
  { title: '消费者', value: 'CONSUMER' },
  { title: '检查员', value: 'INSPECTOR' },
  { title: '筛查员', value: 'SCREENER' },
  { title: '经营者', value: 'OPERATOR' },
]

const actionOptions = [
  { title: '查看', value: 'VIEW' },
  { title: '核销', value: 'VERIFY' },
  { title: '举报', value: 'REPORT' },
]

onMounted(() => {
  loadStats()
  loadData()
})

async function loadStats() {
  try {
    const res = await qrScansApi.stats()
    stats.value = res.data || res
  } catch (e) {
    console.error('加载统计失败', e)
  }
}

async function loadData() {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      ...filters,
    }
    Object.keys(params).forEach(k => params[k] === null && delete params[k])
    const res = await qrScansApi.list(params)
    records.value = res.data?.items || res.items || []
    totalItems.value = res.data?.total || res.total || 0
  } catch (e) {
    console.error('加载扫码记录失败', e)
  } finally {
    loading.value = false
  }
}

function onUpdateOptions(options) {
  if (options.page !== currentPage.value) {
    currentPage.value = options.page
    loadData()
  }
  if (options.itemsPerPage !== pageSize.value) {
    pageSize.value = options.itemsPerPage
    currentPage.value = 1
    loadData()
  }
}

function resetFilters() {
  filters.scannerType = null
  filters.action = null
  currentPage.value = 1
  loadStats()
  loadData()
}

function showDetail(item) {
  selectedRecord.value = item
  detailDialog.value = true
}

function openVerify(item) {
  verifyTarget.value = item
  verifyForm.remark = ''
  verifyForm.location = ''
  verifyDialog.value = true
}

async function doVerify() {
  if (!verifyTarget.value?.qrcode?.id) return
  verifyLoading.value = true
  try {
    await qrcodesApi.verify(verifyTarget.value.qrcode.id, {
      remark: verifyForm.remark,
      location: verifyForm.location,
    })
    verifyDialog.value = false
    loadData()
    loadStats()
  } catch (e) {
    console.error('核销失败', e)
    alert('核销失败：' + (e.message || '未知错误'))
  } finally {
    verifyLoading.value = false
  }
}

function formatTime(time) {
  if (!time) return ''
  const d = new Date(time)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function getActionColor(action) {
  const map = { VIEW: 'info', VERIFY: 'warning', REPORT: 'error' }
  return map[action] || 'default'
}

function getActionLabel(action) {
  const map = { VIEW: '查看', VERIFY: '核销', REPORT: '举报' }
  return map[action] || action || '-'
}

function getScannerTypeLabel(type) {
  const map = { CONSUMER: '消费者', INSPECTOR: '检查员', SCREENER: '筛查员', OPERATOR: '经营者' }
  return map[type] || type || '-'
}
</script>

<style scoped>
.qr-scans-page { padding: 16px; }
</style>