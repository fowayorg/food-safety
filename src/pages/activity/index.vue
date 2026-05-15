<template>
  <div class="activity-page">
    <van-nav-bar title="共治活动" left-arrow @click-left="router.back()" fixed />
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="loadData">
        <van-card
          v-for="item in list"
          :key="item.id"
          :title="item.title"
          class="activity-card"
          @click="goDetail(item)"
        >
          <template #desc>
            <div class="activity-desc">
              <div>📅 {{ formatDate(item.startTime) }}</div>
              <div>📍 {{ item.location || '待定' }}</div>
              <div>👥 {{ item.currentParticipants || 0 }} / {{ item.maxParticipants || '不限' }}人</div>
            </div>
          </template>
          <template #tags>
            <van-tag :type="getStatusTagType(item.status)">{{ getStatusLabel(item.status) }}</van-tag>
          </template>
        </van-card>
        <van-empty v-if="!loading && list.length === 0" description="暂无活动" />
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
import { activitiesApi } from '@/api/index'
import { showToast } from 'vant'
const router = useRouter(); const activeTab = ref(0)
const list = ref([]); const loading = ref(false); const finished = ref(false); const refreshing = ref(false); let page = 1
const loadData = async () => {
  if (loading.value) return; loading.value = true
  try {
    const res = await activitiesApi.list({ page, pageSize: 10 })
    const items = res.items || res.data || []
    if (items.length < 10) finished.value = true
    list.value.push(...items); page++
  } catch { showToast({ message: '加载失败' }); finished.value = true }
  finally { loading.value = false; refreshing.value = false }
}
const onRefresh = () => { list.value = []; finished.value = false; page = 1; loading.value = false; loadData() }
const goDetail = (item) => { router.push(`/activity/${item.id}`) }
const formatDate = (d) => { if (!d) return '-'; const dt = new Date(d); return `${dt.getMonth()+1}-${dt.getDate()} ${dt.getHours()}:${String(dt.getMinutes()).padStart(2,'0')}` }
const getStatusLabel = (s) => { const m = { UPCOMING:'即将开始', ONGOING:'进行中', ENDED:'已结束' }; return m[s] || s || '-' }
const getStatusTagType = (s) => { const m = { UPCOMING:'primary', ONGOING:'success', ENDED:'default' }; return m[s] || 'default' }
</script>
<style scoped>
.activity-page { min-height:100vh; background:#f5f5f5; padding-top:46px; padding-bottom:70px }
.activity-card { margin:8px 12px; border-radius:12px; overflow:hidden }
.activity-desc { display:flex; flex-direction:column; gap:2px; font-size:12px; color:#666 }
</style>
