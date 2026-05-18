<template>
  <div class="rect-page">
    <van-nav-bar title="整改任务" left-arrow @click-left="router.back()" fixed />
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="loadData">
        <van-cell v-for="item in list" :key="item.id" class="rect-card" is-link @click="goExecute(item)">
          <template #title>
            <div class="rect-title">{{ item.entity?.name || '未知主体' }}</div>
          </template>
          <template #label>
            <div class="rect-info">
              <span>问题：{{ item.description || '见详情' }}</span>
            </div>
            <div class="rect-info">
              <span>截止：{{ item.deadline ? formatDate(item.deadline) : '未设期限' }}</span>
              <span v-if="item.level" class="level-tag">风险：{{ getLevelLabel(item.level) }}</span>
            </div>
          </template>
          <template #value>
            <van-tag :type="getStatusType(item.status)">{{ getStatusLabel(item.status) }}</van-tag>
          </template>
        </van-cell>
        <van-empty v-if="!loading && list.length === 0" description="暂无整改任务" />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { rectificationsApi, authApi } from '@/api/index'
import { showToast } from 'vant'

const router = useRouter()
const list = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const entityId = ref(null)

onMounted(() => {
  loadProfile()
})

const loadProfile = async () => {
  try {
    const profile = await authApi.profile()
    if (profile?.entityId) {
      entityId.value = profile.entityId
      loadData()
    } else {
      showToast('当前账号未关联经营主体')
      finished.value = true
    }
  } catch (e) {
    showToast('获取用户信息失败')
    finished.value = true
  }
}

const loadData = async () => {
  if (!entityId.value) return
  try {
    loading.value = true
    const res = await rectificationsApi.list({ entityId: entityId.value, pageSize: 50 })
    const items = res.items || res.data || []
    list.value = items
    finished.value = true
  } catch (e) {
    showToast('加载整改任务失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onRefresh = () => {
  list.value = []
  finished.value = false
  loadData()
}

const goExecute = (item) => {
  router.push(`/rectification/${item.id}`)
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const getStatusLabel = (status) => {
  const map = { PENDING: '待整改', SUBMITTED: '待审核', APPROVED: '已通过', REJECTED: '已驳回' }
  return map[status] || status || '待整改'
}

const getStatusType = (status) => {
  const map = { PENDING: 'warning', SUBMITTED: 'primary', APPROVED: 'success', REJECTED: 'danger' }
  return map[status] || 'warning'
}

const getLevelLabel = (level) => {
  const map = { LOW: '低', MEDIUM: '中', HIGH: '高' }
  return map[level] || level || '低'
}
</script>

<style scoped>
.rect-page { min-height: 100vh; background: #f5f5f5; padding-top: 46px; padding-bottom: 60px; }
.rect-card { margin: 8px 12px; border-radius: 8px; }
.rect-title { font-weight: bold; font-size: 15px; color: #333; }
.rect-info { font-size: 12px; color: #999; margin-top: 4px; display: flex; gap: 8px; }
.level-tag { color: #ff6600; }
</style>
