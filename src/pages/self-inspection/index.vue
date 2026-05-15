<template>
  <div class="si-page">
    <van-nav-bar title="自查自纠" left-arrow @click-left="router.back()" fixed />
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="loadData">
        <van-cell v-for="item in list" :key="item.id" class="si-card" is-link @click="goExecute(item)">
          <template #title><div class="si-title">{{ item.entity?.name || '未知主体' }}</div></template>
          <template #label>
            <div class="si-info">
              <span>📅 {{ formatDate(item.deadline) }}</span>
              <span>⏰ {{ getPeriodLabel(item.period) }}</span>
            </div>
          </template>
          <template #value><van-tag :type="item.status === 'SUBMITTED' ? 'success' : 'warning'">{{ item.status === 'SUBMITTED' ? '已提交' : '待自查' }}</van-tag></template>
        </van-cell>
        <van-empty v-if="!loading && list.length === 0" description="暂无自查任务" />
      </van-list>
    </van-pull-refresh>
    <van-tabbar v-model="activeTab" route fixed placeholder>
      <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item><van-tabbar-item to="/inspection" icon="records">检查</van-tabbar-item>
      <van-tabbar-item to="/complaint" icon="warning-o">投诉</van-tabbar-item><van-tabbar-item to="/notification" icon="bell">消息</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { selfInspectionsApi } from '@/api/index'
import { showToast } from 'vant'
const router = useRouter()
const activeTab = ref(0); const list = ref([]); const loading = ref(false)
const finished = ref(false); const refreshing = ref(false); let page = 1
const loadData = async () => {
  if (loading.value) return; loading.value = true
  try {
    const res = await selfInspectionsApi.list({ page, pageSize: 10 })
    const items = res.items || res.data || []
    if (items.length < 10) finished.value = true
    list.value.push(...items); page++
  } catch { showToast({ message: '加载失败' }); finished.value = true }
  finally { loading.value = false; refreshing.value = false }
}
const onRefresh = () => { list.value = []; finished.value = false; page = 1; loading.value = false; loadData() }
const goExecute = (item) => { router.push(`/self-inspection/${item.id}`) }
const formatDate = (d) => { if (!d) return '-'; const dt = new Date(d); return `${dt.getMonth()+1}-${dt.getDate()}` }
const getPeriodLabel = (p) => { const m = { DAILY:'每日', WEEKLY:'每周', MONTHLY:'每月' }; return m[p] || p || '-' }
</script>
<style scoped>
.si-page { min-height:100vh; background:#f5f5f5; padding-top:92px; padding-bottom:70px }
.si-card { margin:8px 12px; border-radius:12px; background:#fff }
.si-title { font-size:15px; font-weight:bold; color:#333; margin-bottom:4px }
.si-info { display:flex; flex-direction:column; gap:2px; font-size:12px; color:#999 }
</style>
