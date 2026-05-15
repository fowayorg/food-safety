<template>
  <div class="activity-participation-page">
    <van-nav-bar title="我的活动参与" left-arrow @click-left="router.back()" fixed />

    <van-tabs v-model:active="activeStatus" sticky offset-top="46px" @change="onTabChange">
      <van-tab title="全部" name="ALL" />
      <van-tab title="进行中" name="ACTIVE" />
      <van-tab title="已结束" name="ENDED" />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loadingMore" :finished="finished" finished-text="没有更多了" @load="onLoadMore">
        <div v-for="item in list" :key="item.id" class="participation-card" @click="viewActivity(item)">
          <div class="card-header">
            <div class="activity-name">{{ item.activity?.name || '未知活动' }}</div>
            <van-tag :type="statusTagMap[item.activity?.status]">{{ statusLabelMap[item.activity?.status] }}</van-tag>
          </div>
          <div class="card-content">
            <div class="info-row">
              <van-icon name="clock-o" />
              <span>{{ formatTime(item.activity?.startDate) }} ~ {{ formatTime(item.activity?.endDate) }}</span>
            </div>
            <div class="info-row">
              <van-icon name="friends-o" />
              <span>参与时间：{{ formatTime(item.joinedAt || item.createdAt) }}</span>
            </div>
            <div v-if="item.activity?.description" class="activity-desc">
              {{ item.activity.description.slice(0, 50) }}{{ item.activity.description.length > 50 ? '...' : '' }}
            </div>
          </div>
        </div>
        <van-empty v-if="!loadingMore && list.length === 0" description="暂无参与记录" />
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { activitiesApi } from '@/api/index'

const router = useRouter()

const refreshing = ref(false)
const loadingMore = ref(false)
const finished = ref(false)
const list = ref([])
const activeStatus = ref('ALL')
const activeTab = ref(0)
const page = ref(1)

const statusLabelMap = {
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  ACTIVE: '进行中',
  ENDED: '已结束',
  CANCELLED: '已取消',
}

const statusTagMap = {
  DRAFT: 'default',
  PUBLISHED: 'primary',
  ACTIVE: 'success',
  ENDED: 'default',
  CANCELLED: 'danger',
}

function formatTime(time) {
  if (!time) return ''
  const d = new Date(time)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

async function loadData(reset = false) {
  if (reset) {
    page.value = 1
    list.value = []
    finished.value = false
  }

  try {
    const res = await activitiesApi.getMyParticipations({ page: page.value, pageSize: 10, status: activeStatus.value === 'ALL' ? undefined : activeStatus.value })
    const items = res.data?.items || []

    if (reset) {
      list.value = items
    } else {
      list.value.push(...items)
    }

    if (items.length < 10) {
      finished.value = true
    }
  } catch (e) {
    console.error('加载失败', e)
    finished.value = true
  }
}

async function onRefresh() {
  await loadData(true)
  refreshing.value = false
}

async function onLoadMore() {
  page.value++
  await loadData()
  loadingMore.value = false
}

function onTabChange() {
  loadData(true)
}

function viewActivity(item) {
  if (item.activity?.id) {
    router.push(`/activity/${item.activity.id}`)
  }
}

onMounted(() => {
  loadData(true)
})
</script>

<style scoped>
.activity-participation-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.participation-card {
  background: #fff;
  margin: 12px 16px;
  border-radius: 8px;
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.activity-name {
  font-size: 16px;
  font-weight: bold;
}

.card-content {
  font-size: 14px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  margin-bottom: 6px;
}

.activity-desc {
  color: #999;
  font-size: 13px;
  margin-top: 8px;
  line-height: 1.5;
}
</style>
