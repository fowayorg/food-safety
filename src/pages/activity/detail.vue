<template>
  <div class="detail-page">
    <van-nav-bar title="活动详情" left-arrow @click-left="router.back()" fixed />
    <van-loading v-if="loading" class="loading" />
    <van-empty v-else-if="!activity" description="活动不存在" />
    <div v-else class="content">
      <!-- 活动信息 -->
      <div class="activity-header">
        <div class="activity-title">{{ activity.name }}</div>
        <van-tag :type="getStatusTagType(activity.status)" size="medium">{{ getStatusLabel(activity.status) }}</van-tag>
      </div>
      
      <van-cell-group inset title="活动信息">
        <van-cell title="活动类型">
          <template #value>
            <van-tag :color="getTypeColor(activity.type)" size="small">{{ getTypeLabel(activity.type) }}</van-tag>
          </template>
        </van-cell>
        <van-cell title="活动时间" :value="formatDateRange(activity.startDate, activity.endDate)" />
        <van-cell title="参与人数">{{ participantCount }} 人</van-cell>
        <van-cell title="目标受众" :value="getAudienceLabel(activity.targetAudience)" />
      </van-cell-group>
      
      <van-cell-group inset title="活动描述">
        <div class="desc-text">{{ activity.description || '暂无描述' }}</div>
      </van-cell-group>

      <!-- 投票类型 -->
      <van-cell-group v-if="activity.type === 'VOTE' && config?.options?.length" inset title="投票选项">
        <van-radio-group v-model="voteChoice">
          <van-cell v-for="(opt, i) in config.options" :key="i" :title="opt" clickable @click="voteChoice = i">
            <template #right-icon>
              <van-radio :name="i" />
            </template>
          </van-cell>
        </van-radio-group>
      </van-cell-group>

      <!-- 建议类型 -->
      <van-cell-group v-if="activity.type === 'SUGGESTION'" inset title="您的建议">
        <div class="suggest-box">
          <van-field v-model="suggestContent" rows="4" autosize type="textarea" maxlength="500" show-word-limit
            placeholder="请输入您的意见建议..." :disabled="hasJoined" />
          <div v-if="config?.allowAnonymous" class="anon-tip">
            <van-icon name="info-o" /> 支持匿名提交
          </div>
        </div>
      </van-cell-group>

      <!-- 参与结果 -->
      <van-cell-group v-if="hasJoined && activity.type !== 'PROMOTION'" inset title="已提交内容">
        <van-cell :title="activity.type === 'VOTE' ? '投票选择' : '建议内容'" :value="submittedContent || '-'" />
      </van-cell-group>

      <!-- 操作按钮 -->
      <div class="action-row">
        <van-button v-if="!hasJoined" type="primary" block round :loading="joining" 
          :disabled="activity.status === 'ENDED' || activity.status === 'CANCELLED'"
          @click="handleParticipate">
          {{ activity.status === 'ENDED' ? '活动已结束' : activity.status === 'CANCELLED' ? '活动已取消' : '提交参与' }}
        </van-button>
        <van-button v-else type="success" block round disabled>已参与</van-button>
      </div>
    </div>

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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { activitiesApi } from '@/api/index'
import { showToast, showSuccessToast } from 'vant'

const router = useRouter()
const route = useRoute()
const activeTab = ref(0)
const loading = ref(true)
const joining = ref(false)
const activity = ref(null)
const participantCount = ref(0)
const hasJoined = ref(false)
const submittedContent = ref('')

const voteChoice = ref(null)
const suggestContent = ref('')

const config = computed(() => {
  if (!activity.value?.config) return null
  try {
    return typeof activity.value.config === 'string' ? JSON.parse(activity.value.config) : activity.value.config
  } catch { return null }
})

onMounted(async () => {
  const id = route.params.id
  if (!id) { showToast({ message: '缺少活动ID' }); router.back(); return }
  try {
    const res = await activitiesApi.get(id)
    activity.value = res.data || res
    participantCount.value = activity.value._count?.participants ?? 0
    
    // 获取参与者统计
    try {
      const stats = await activitiesApi.stats(id)
      participantCount.value = stats.participantCount || 0
    } catch {}
    
    // 检查是否已参与（通过用户登录态）
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const parts = await activitiesApi.participants(id)
        const profile = await activitiesApi.profile?.() || {}
        hasJoined.value = parts.some(p => p.userId === profile.id)
        if (hasJoined.value) {
          const myPart = parts.find(p => p.userId === profile.id)
          submittedContent.value = myPart?.content || ''
        }
      } catch {}
    }
  } catch { showToast({ message: '加载失败' }) }
  finally { loading.value = false }
})

const handleParticipate = async () => {
  joining.value = true
  try {
    const payload = {}
    
    if (activity.value.type === 'VOTE') {
      if (voteChoice.value === null) { showToast({ message: '请选择投票选项' }); joining.value = false; return }
      const cfg = config.value
      payload.content = cfg?.options?.[voteChoice.value] || `选项${voteChoice.value + 1}`
    } else if (activity.value.type === 'SUGGESTION') {
      if (!suggestContent.value.trim()) { showToast({ message: '请输入建议内容' }); joining.value = false; return }
      payload.content = suggestContent.value.trim()
    }
    
    // 尝试携带用户信息
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const profile = await (await fetch('http://localhost:5100/api/v1/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })).json()
        payload.userId = profile.id
      } catch {}
    }
    
    await activitiesApi.participate(activity.value.id, payload)
    hasJoined.value = true
    submittedContent.value = payload.content || ''
    showSuccessToast({ message: '参与成功' })
  } catch (e) {
    showToast({ message: e?.response?.data?.message || '参与失败' })
  } finally { joining.value = false }
}

const formatDateRange = (start, end) => {
  const s = start ? new Date(start).toLocaleDateString('zh-CN') : '-'
  const e = end ? new Date(end).toLocaleDateString('zh-CN') : '无'
  return `${s} ~ ${e}`
}
const getStatusLabel = s => ({ UPCOMING:'即将开始', PUBLISHED:'已发布', ACTIVE:'进行中', ENDED:'已结束', CANCELLED:'已取消', DRAFT:'草稿' }[s] || s)
const getStatusTagType = s => ({ UPCOMING:'primary', ACTIVE:'success', PUBLISHED:'primary', ENDED:'default', CANCELLED:'danger', DRAFT:'warning' }[s] || 'default')
const getTypeLabel = t => ({ VOTE:'投票活动', SUGGESTION:'意见建议', PROMOTION:'促销活动', SURVEY:'问卷调查' }[t] || t)
const getTypeColor = t => ({ VOTE:'blue', SUGGESTION:'green', PROMOTION:'orange', SURVEY:'purple' }[t] || 'grey')
const getAudienceLabel = a => ({ ALL:'全部', OPERATOR:'经营者', CONSUMER:'消费者' }[a] || a || '全部')
</script>

<style scoped>
.detail-page { min-height:100vh; background:#f5f5f5; padding-top:46px; padding-bottom:70px }
.loading { display:flex; justify-content:center; padding:60px 0 }
.content { padding:12px 0 }
.activity-header { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; background:#fff; margin:0 16px 12px; border-radius:12px }
.activity-title { font-size:18px; font-weight:bold; color:#333; flex:1 }
.desc-text { padding:12px 16px; font-size:14px; color:#666; line-height:1.6 }
.suggest-box { padding:8px 16px }
.anon-tip { font-size:12px; color:#999; margin-top:8px }
.action-row { margin:20px 16px }
</style>
