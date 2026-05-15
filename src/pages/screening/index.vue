<template>
  <div class="screening-list-page">
    <van-nav-bar title="排查记录" fixed>
      <template #right>
        <van-icon name="scan" size="20" @click="handleScan" />
      </template>
    </van-nav-bar>

    <van-loading v-if="loading" class="loading" />
    <van-empty v-else-if="records.length === 0" description="暂无排查记录" />

    <div v-else class="record-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loadingMore"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoadMore"
        >
          <div v-for="record in records" :key="record.id" class="record-card" @click="viewDetail(record)">
            <div class="record-header">
              <div class="entity-name">{{ record.entity?.name || '未知主体' }}</div>
              <van-tag :type="riskTagMap[record.riskLevel]">{{ riskLabelMap[record.riskLevel] }}</van-tag>
            </div>
            <div class="record-info">
              <div class="info-row">
                <van-icon name="location-o" />
                <span>{{ record.entity?.address || '未知地址' }}</span>
              </div>
              <div class="info-row">
                <van-icon name="clock-o" />
                <span>{{ formatTime(record.screenedAt || record.createdAt) }}</span>
              </div>
              <div class="info-row">
                <van-icon name="user-o" />
                <span>{{ record.screener?.realName || record.screener?.username || '未知排查员' }}</span>
              </div>
            </div>
            <div v-if="record.issues" class="record-issues">
              <van-icon name="warning-o" color="#ee0a24" />
              <span>{{ record.issues }}</span>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 底部导航 -->
    <van-tabbar v-model="activeTab" route fixed placeholder>
      <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/inspection" icon="records">检查</van-tabbar-item>
      <van-tabbar-item to="/complaint" icon="warning-o">投诉</van-tabbar-item>
      <van-tabbar-item to="/notification" icon="bell">消息</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast } from 'vant'
import { screeningsApi } from '@/api/index'

const router = useRouter()

const loading = ref(false)
const refreshing = ref(false)
const loadingMore = ref(false)
const finished = ref(false)
const records = ref([])
const activeTab = ref(0)
const page = ref(1)
const pageSize = 10

const riskLabelMap = {
  LOW: '低风险',
  LOWER: '较低风险',
  MEDIUM: '中等风险',
  HIGHER: '较高风险',
  HIGH: '高风险',
  UNRATED: '未评级',
}

const riskTagMap = {
  LOW: 'success',
  LOWER: 'primary',
  MEDIUM: 'warning',
  HIGHER: 'danger',
  HIGH: 'danger',
  UNRATED: 'default',
}

function formatTime(time) {
  if (!time) return ''
  const d = new Date(time)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

async function loadRecords(reset = false) {
  if (reset) {
    page.value = 1
    records.value = []
    finished.value = false
  }

  try {
    const res = await screeningsApi.getMy({ page: page.value, pageSize })
    const items = res.data?.items || []

    if (reset) {
      records.value = items
    } else {
      records.value.push(...items)
    }

    if (items.length < pageSize) {
      finished.value = true
    }
  } catch (e) {
    console.error('加载排查记录失败', e)
    finished.value = true
  }
}

async function onRefresh() {
  await loadRecords(true)
  refreshing.value = false
  showSuccessToast('刷新成功')
}

async function onLoadMore() {
  page.value++
  await loadRecords()
  loadingMore.value = false
}

function viewDetail(record) {
  router.push({ name: 'ScreeningDetail', params: { id: record.id } })
}

function handleScan() {
  // 扫码后跳转到执行页
  router.push({ name: 'ScreeningExecute', query: { entityId: 'SCANNED_ID' } })
}

onMounted(() => {
  loading.value = true
  loadRecords(true).finally(() => {
    loading.value = false
  })
})
</script>

<style scoped>
.screening-list-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 100px 0;
}

.record-list {
  padding: 56px 16px 16px;
}

.record-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.entity-name {
  font-size: 16px;
  font-weight: bold;
}

.record-info {
  margin-bottom: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.record-issues {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 13px;
  color: #ee0a24;
  background: #fff5f5;
  padding: 8px;
  border-radius: 4px;
  margin-top: 8px;
}
</style>
