<template>
  <div class="inspection-page">
    <van-nav-bar title="我的检查" left-arrow @click-left="router.back()" fixed />

    <van-tabs v-model:active="activeTab" sticky offset-top="46px" @change="onTabChange">
      <van-tab title="全部" name="ALL" />
      <van-tab title="待检查" name="PENDING" />
      <van-tab title="进行中" name="IN_PROGRESS" />
      <van-tab title="已完成" name="COMPLETED" />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadData"
      >
        <van-cell
          v-for="item in list"
          :key="item.id"
          class="inspection-card"
          is-link
          @click="goExecute(item)"
        >
          <template #title>
            <div class="inspection-title">{{ item.entity?.name || '未知主体' }}</div>
          </template>
          <template #label>
            <div class="inspection-info">
              <span>📅 {{ formatDate(item.planDate) }}</span>
              <span v-if="item.template?.name">📋 {{ item.template.name }}</span>
            </div>
          </template>
          <template #value>
            <van-tag :type="getStatusTagType(item.status)">
              {{ getStatusLabel(item.status) }}
            </van-tag>
          </template>
        </van-cell>

        <van-empty v-if="!loading && list.length === 0" description="暂无检查任务" />
      </van-list>
    </van-pull-refresh>

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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { inspectionsApi } from '@/api/index'
import { showToast } from 'vant'

const router = useRouter()
const activeTab = ref(0)
const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const statusFilter = ref('')

const onTabChange = (name) => {
  statusFilter.value = name === 'ALL' ? '' : name
  list.value = []
  finished.value = false
  page.value = 1
  loadData()
}

const loadData = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const params = { page: page.value, pageSize: 10 }
    if (statusFilter.value) params.status = statusFilter.value
    const res = await inspectionsApi.list(params)
    const items = res.items || res.data || []
    if (items.length < 10) finished.value = true
    list.value.push(...items)
    page.value++
  } catch (e) {
    showToast({ message: '加载失败' })
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onRefresh = () => {
  list.value = []
  finished.value = false
  page.value = 1
  loading.value = false
  loadData()
}

const goExecute = (item) => {
  router.push(`/inspection/${item.id}`)
}

const formatDate = (d) => {
  if (!d) return '-'
  const dt = new Date(d)
  return `${dt.getMonth()+1}-${dt.getDate()} ${dt.getHours()}:${String(dt.getMinutes()).padStart(2,'0')}`
}

const getStatusLabel = (s) => {
  const map = { PENDING: '待检查', IN_PROGRESS: '进行中', COMPLETED: '已完成', CANCELLED: '已取消' }
  return map[s] || s || '-'
}

const getStatusTagType = (s) => {
  const map = { PENDING: 'warning', IN_PROGRESS: 'primary', COMPLETED: 'success', CANCELLED: 'default' }
  return map[s] || 'default'
}
</script>

<style scoped>
.inspection-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 92px;
  padding-bottom: 70px;
}

.inspection-card {
  margin: 8px 12px;
  border-radius: 12px;
  background: #fff;
}

.inspection-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.inspection-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: #999;
}
</style>
