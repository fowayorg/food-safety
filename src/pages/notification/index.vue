<template>
  <div class="notif-page">
    <van-nav-bar title="消息通知" fixed />
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="loadData">
        <van-cell
          v-for="item in list"
          :key="item.id"
          class="notif-card"
          :class="{ unread: !item.isRead }"
          is-link
          @click="handleRead(item)"
        >
          <template #title>
            <div class="notif-title">
              <van-badge dot v-if="!item.isRead"><span class="title-text">{{ item.title }}</span></van-badge>
              <span v-else class="title-text">{{ item.title }}</span>
            </div>
          </template>
          <template #label>
            <div class="notif-content">{{ item.content || item.message }}</div>
            <div class="notif-time">{{ formatDate(item.createdAt) }}</div>
          </template>
        </van-cell>
        <van-empty v-if="!loading && list.length === 0" description="暂无通知" />
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
import { notificationsApi } from '@/api/index'
import { showToast } from 'vant'
const activeTab = ref(3)
const list = ref([]); const loading = ref(false); const finished = ref(false); const refreshing = ref(false); let page = 1
const loadData = async () => {
  if (loading.value) return; loading.value = true
  try {
    const res = await notificationsApi.list({ page, pageSize: 15 })
    const items = res.items || res.data || []
    if (items.length < 15) finished.value = true
    list.value.push(...items); page++
  } catch { showToast({ message: '加载失败' }); finished.value = true }
  finally { loading.value = false; refreshing.value = false }
}
const onRefresh = () => { list.value = []; finished.value = false; page = 1; loading.value = false; loadData() }
const handleRead = async (item) => {
  if (item.isRead) return
  try {
    await notificationsApi.markRead(item.id)
    item.isRead = true
  } catch {}
}
const formatDate = (d) => { if (!d) return '-'; const dt = new Date(d); return `${dt.getMonth()+1}-${dt.getDate()} ${dt.getHours()}:${String(dt.getMinutes()).padStart(2,'0')}` }
</script>
<style scoped>
.notif-page { min-height:100vh; background:#f5f5f5; padding-top:46px; padding-bottom:70px }
.notif-card { margin:8px 12px; border-radius:12px; background:#fff }
.unread { background:#EBF5FF }
.notif-title { margin-bottom:4px }
.title-text { font-size:15px; font-weight:bold; color:#333 }
.notif-content { font-size:13px; color:#666; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin-bottom:4px }
.notif-time { font-size:12px; color:#999 }
</style>
