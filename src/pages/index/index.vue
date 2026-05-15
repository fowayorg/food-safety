<template>
  <div class="home-page">
    <!-- 顶部 -->
    <div class="home-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <div class="brand-row">
          <div class="brand-logo">食</div>
          <span class="brand-name">一店一码</span>
        </div>
        <van-search
          shape="round"
          background="rgba(255,255,255,0.15)"
          placeholder="扫描商户二维码"
          readonly
          @click="goScan"
        >
          <template #left-icon>
            <van-icon name="scan" />
          </template>
        </van-search>
      </div>
    </div>

    <!-- 扫描大按钮 -->
    <div class="scan-card" @click="goScan">
      <div class="scan-icon-wrap">
        <van-icon name="scan" size="32" color="#1976D2" />
      </div>
      <div class="scan-text">
        <div class="scan-title">扫描二维码</div>
        <div class="scan-desc">扫描商户二维码查看信息</div>
      </div>
      <van-icon name="arrow" size="18" color="#ccc" />
    </div>

    <!-- 功能菜单 -->
    <div class="menu-section">
      <div class="menu-grid">
        <div class="menu-item" @click="goPage('/inspection')">
          <div class="menu-icon" style="background:#E3F2FD">
            <van-icon name="records" size="24" color="#1976D2" />
          </div>
          <span class="menu-text">我的检查</span>
        </div>
        <div class="menu-item" @click="goPage('/self-inspection')">
          <div class="menu-icon" style="background:#E8F5E9">
            <van-icon name="passed" size="24" color="#4CAF50" />
          </div>
          <span class="menu-text">自查自纠</span>
        </div>
        <div class="menu-item" @click="goPage('/complaint/submit')">
          <div class="menu-icon" style="background:#FFF3E0">
            <van-icon name="warning-o" size="24" color="#FF9800" />
          </div>
          <span class="menu-text">投诉举报</span>
        </div>
        <div class="menu-item" @click="goPage('/activity')">
          <div class="menu-icon" style="background:#FCE4EC">
            <van-icon name="star-o" size="24" color="#E91E63" />
          </div>
          <span class="menu-text">共治活动</span>
        </div>
        <div class="menu-item" @click="goPage('/notification')">
          <div class="menu-icon" style="background:#F3E5F5">
            <van-icon name="bell" size="24" color="#9C27B0" />
          </div>
          <span class="menu-text">消息通知</span>
        </div>
        <div class="menu-item" @click="goPage('/profile')">
          <div class="menu-icon" style="background:#EFEBE9">
            <van-icon name="user-o" size="24" color="#795548" />
          </div>
          <span class="menu-text">个人中心</span>
        </div>
      </div>
    </div>

    <!-- 最新活动 -->
    <div class="section" v-if="activities.length > 0">
      <div class="section-title">
        <span class="title-text">最新活动</span>
        <span class="more-link" @click="goPage('/activity')">更多 ›</span>
      </div>
      <van-card
        v-for="item in activities"
        :key="item.id"
        :title="item.title"
        :desc="formatTime(item.startTime)"
        class="activity-card"
        @click="goPage(`/activity/${item.id}`)"
      >
        <template #tags>
          <van-tag :type="getActivityTagType(item.status)" size="small">
            {{ getActivityStatus(item.status) }}
          </van-tag>
        </template>
      </van-card>
    </div>

    <!-- 未登录引导 -->
    <div class="guest-tip" v-if="!isLoggedIn">
      <van-notice-bar left-icon="info-o" text="登录后可使用全部功能" />
      <van-button type="primary" block round @click="goPage('/login')">
        立即登录
      </van-button>
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
import { activitiesApi } from '@/api/index'
import { showToast } from 'vant'

const router = useRouter()
const activeTab = ref(0)
const isLoggedIn = ref(false)
const activities = ref([])

onMounted(() => {
  const token = localStorage.getItem('token')
  isLoggedIn.value = !!token
  loadActivities()
})

const loadActivities = async () => {
  try {
    const res = await activitiesApi.list({ pageSize: 3 })
    activities.value = (res.items || res.data || []).slice(0, 3)
  } catch (e) {
    console.error('加载活动失败', e)
  }
}

const goScan = () => {
  // 在实际微信小程序中，这里调用 wx.scanCode
  // H5 环境下提示用户使用微信扫一扫
  showToast('请使用微信扫一扫扫描商户二维码')
}

const goPage = (path) => {
  const token = localStorage.getItem('token')
  if (!token && path !== '/login' && path !== '/entity/:id') {
    router.push('/login')
    return
  }
  router.push(path)
}

const formatTime = (time) => {
  if (!time) return ''
  const d = new Date(time)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const getActivityStatus = (status) => {
  const map = { UPCOMING: '即将开始', ONGOING: '进行中', ENDED: '已结束' }
  return map[status] || status || '进行中'
}

const getActivityTagType = (status) => {
  const map = { UPCOMING: 'primary', ONGOING: 'success', ENDED: 'default' }
  return map[status] || 'default'
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 70px;
}

.home-header {
  position: relative;
  padding-bottom: 60px;
}

.header-bg {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 180px;
  background: linear-gradient(135deg, #1976D2, #42A5F5);
  border-radius: 0 0 24px 24px;
}

.header-content {
  position: relative;
  padding: 16px 16px 0;
}

.brand-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: #fff;
}

.brand-logo {
  width: 36px; height: 36px;
  background: rgba(255,255,255,0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  margin-right: 8px;
}

.brand-name {
  font-size: 18px;
  font-weight: bold;
}

.scan-card {
  display: flex;
  align-items: center;
  background: #fff;
  margin: -44px 16px 12px;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.scan-icon-wrap {
  width: 52px; height: 52px;
  background: #E3F2FD;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.scan-text { flex: 1; }
.scan-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 4px; }
.scan-desc { font-size: 12px; color: #999; }

.menu-section {
  margin: 0 16px 12px;
}

.menu-grid {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.menu-icon {
  width: 48px; height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-text {
  font-size: 12px;
  color: #333;
}

.section {
  margin: 0 16px 12px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.title-text {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.more-link {
  font-size: 13px;
  color: #1976D2;
}

.activity-card {
  margin-bottom: 8px;
  border-radius: 12px;
  overflow: hidden;
}

.guest-tip {
  margin: 16px;
}

.guest-tip .van-button {
  margin-top: 12px;
}
</style>
