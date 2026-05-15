<template>
  <div class="complaint-page">
    <van-nav-bar title="我的投诉" left-arrow @click-left="router.back()" fixed />

    <van-tabs v-model:active="activeTab" sticky offset-top="46px" @change="onTabChange">
      <van-tab title="全部" name="ALL" />
      <van-tab title="待处理" name="PENDING" />
      <van-tab title="处理中" name="PROCESSING" />
      <van-tab title="已完成" name="COMPLETED" />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="loadData">
        <van-cell
          v-for="item in list"
          :key="item.id"
          class="complaint-card"
          is-link
        >
          <template #title>
            <div class="complaint-title">{{ getCategoryLabel(item.category) }}</div>
          </template>
          <template #label>
            <div class="complaint-desc">{{ item.content || item.description }}</div>
            <div class="complaint-time">{{ formatDate(item.createdAt) }}</div>
          </template>
          <template #value>
            <van-tag :type="getStatusTagType(item.status)">
              {{ getStatusLabel(item.status) }}
            </van-tag>
          </template>
        </van-cell>
        <van-empty v-if="!loading && list.length === 0" description="暂无投诉记录" />
      </van-list>
    </van-pull-refresh>

    <!-- 底部导航 -->
    <van-tabbar v-model="activeTab2" route fixed placeholder>
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
import { complaintsApi } from '@/api/index'
import { showToast } from 'vant'

const router = useRouter()
const activeTab = ref(0)
const activeTab2 = ref(2)
const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const statusFilter = ref('')

const onTabChange = (name) => {
  statusFilter.value = name === 'ALL' ? '' : name
  reset()
  loadData()
}

const reset = () => { list.value = []; finished.value = false; page.value = 1 }

const loadData = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const params = { page: page.value, pageSize: 10 }
    if (statusFilter.value) params.status = statusFilter.value
    const res = await complaintsApi.list(params)
    const items = res.items || res.data || []
    if (items.length < 10) finished.value = true
    list.value.push(...items)
    page.value++
  } catch { showToast({ message: '加载失败' }); finished.value = true }
  finally { loading.value = false; refreshing.value = false }
}

const onRefresh = () => { reset(); loading.value = false; loadData() }

const formatDate = (d) => { if (!d) return '-'; const dt = new Date(d); return `${dt.getMonth()+1}-${dt.getDate()} ${dt.getHours()}:${String(dt.getMinutes()).padStart(2,'0')}` }
const getCategoryLabel = (c) => { const m = { FOOD_SAFETY:'食品安全', SANITATION:'卫生环境', LICENSE:'证照问题', FRAUD:'虚假宣传', PRICE:'价格欺诈', OTHER:'其他' }; return m[c] || c || '-' }
const getStatusLabel = (s) => { const m = { PENDING:'待处理', PROCESSING:'处理中', COMPLETED:'已完成', REJECTED:'已驳回' }; return m[s] || s || '-' }
const getStatusTagType = (s) => { const m = { PENDING:'warning', PROCESSING:'primary', COMPLETED:'success', REJECTED:'danger' }; return m[s] || 'default' }
</script>

<style scoped>
.complaint-page { min-height:100vh; background:#f5f5f5; padding-top:92px; padding-bottom:70px }
.complaint-card { margin:8px 12px; border-radius:12px; background:#fff }
.complaint-title { font-size:15px; font-weight:bold; color:#333; margin-bottom:4px }
.complaint-desc { font-size:13px; color:#666; margin-bottom:4px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden }
.complaint-time { font-size:12px; color:#999 }
</style>
