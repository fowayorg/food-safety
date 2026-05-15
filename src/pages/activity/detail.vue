<template>
  <div class="detail-page">
    <van-nav-bar title="活动详情" left-arrow @click-left="router.back()" fixed />
    <van-loading v-if="loading" class="loading" />
    <van-empty v-else-if="!activity" description="活动不存在" />
    <div v-else class="content">
      <div class="activity-header">
        <div class="activity-title">{{ activity.title }}</div>
        <van-tag :type="getStatusTagType(activity.status)" size="medium">{{ getStatusLabel(activity.status) }}</van-tag>
      </div>
      <van-cell-group inset title="活动信息">
        <van-cell title="活动时间" :value="formatDate(activity.startTime) + (activity.endTime ? ' ~ ' + formatDate(activity.endTime) : '')" />
        <van-cell title="活动地点" :value="activity.location || '待定'" />
        <van-cell title="参与人数">{{ activity.currentParticipants || 0 }} / {{ activity.maxParticipants || '不限' }}</van-cell>
        <van-cell title="组织者" :value="activity.organizer?.name || activity.organizerName || '-'" />
      </van-cell-group>
      <van-cell-group inset title="活动描述">
        <div class="desc-text">{{ activity.description || '暂无描述' }}</div>
      </van-cell-group>
      <div class="action-row">
        <van-button type="primary" block round :loading="joining" :disabled="activity.status === 'ENDED' || activity.hasJoined" @click="handleJoin">
          {{ activity.hasJoined ? '已报名参加' : activity.status === 'ENDED' ? '活动已结束' : '立即报名参加' }}
        </van-button>
      </div>
    </div>
    <van-tabbar v-model="activeTab" route fixed placeholder>
      <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item><van-tabbar-item to="/inspection" icon="records">检查</van-tabbar-item>
      <van-tabbar-item to="/complaint" icon="warning-o">投诉</van-tabbar-item><van-tabbar-item to="/notification" icon="bell">消息</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { activitiesApi } from '@/api/index'
import { showToast, showSuccessToast } from 'vant'
const router = useRouter(); const route = useRoute()
const activeTab = ref(0); const loading = ref(true); const joining = ref(false); const activity = ref(null)
onMounted(async () => {
  const id = route.params.id
  if (!id) { showToast({ message: '缺少活动ID' }); router.back(); return }
  try {
    const res = await activitiesApi.get(id)
    activity.value = res.data || res
  } catch { showToast({ message: '加载失败' }) }
  finally { loading.value = false }
})
const handleJoin = async () => {
  joining.value = true
  try {
    await activitiesApi.join(activity.value.id)
    activity.value.hasJoined = true
    showSuccessToast({ message: '报名成功' })
  } catch { showToast({ message: '报名失败，请重试' }) }
  finally { joining.value = false }
}
const formatDate = (d) => { if (!d) return '-'; const dt = new Date(d); return `${dt.getMonth()+1}-${dt.getDate()} ${dt.getHours()}:${String(dt.getMinutes()).padStart(2,'0')}` }
const getStatusLabel = (s) => { const m = { UPCOMING:'即将开始', ONGOING:'进行中', ENDED:'已结束' }; return m[s] || s || '-' }
const getStatusTagType = (s) => { const m = { UPCOMING:'primary', ONGOING:'success', ENDED:'default' }; return m[s] || 'default' }
</script>
<style scoped>
.detail-page { min-height:100vh; background:#f5f5f5; padding-top:46px; padding-bottom:70px }
.loading { display:flex; justify-content:center; padding:60px 0 }
.content { padding:12px 0 }
.activity-header { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; background:#fff; margin:0 16px 12px; border-radius:12px }
.activity-title { font-size:18px; font-weight:bold; color:#333; flex:1 }
.desc-text { padding:12px 16px; font-size:14px; color:#666; line-height:1.6 }
.action-row { margin:20px 16px }
</style>
