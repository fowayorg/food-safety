<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" :rail="rail" permanent :width="240">
      <v-list-item class="px-4 py-3" height="64">
        <template #prepend>
          <v-avatar color="primary" size="40">
            <span class="text-white font-weight-bold">食</span>
          </v-avatar>
        </template>
        <v-list-item-title class="text-h6 font-weight-bold">一店一码</v-list-item-title>
        <v-list-item-subtitle>监管系统</v-list-item-subtitle>
        <template #append>
          <v-btn :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'" variant="text" @click="rail = !rail" />
        </template>
      </v-list-item>

      <v-divider />

      <v-list density="compact" nav>
        <v-list-item v-for="item in menuItems" :key="item.to" :to="item.to" :prepend-icon="item.icon" :title="item.title" :value="item.to" rounded="lg" class="mb-1" />
      </v-list>

      <template #append>
        <v-divider />
        <v-list density="compact" nav>
          <v-list-item prepend-icon="mdi-cog" title="系统设置" to="/settings" rounded="lg" />
          <v-list-item prepend-icon="mdi-logout" title="退出登录" @click="handleLogout" rounded="lg" />
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-app-bar color="primary" density="compact">
      <v-app-bar-title class="text-white font-weight-bold">食品安全监管系统 - 管理端</v-app-bar-title>
      <template #append>
        <v-chip variant="elevated" color="white" class="mr-2" size="small">
          <v-avatar start color="primary" size="24">
            <span class="text-caption">管</span>
          </v-avatar>
          {{ currentUser }}
        </v-chip>
      </template>
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-4" style="min-width: 800px">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const drawer = ref(true)
const rail = ref(false)
const currentUser = ref(localStorage.getItem('username') || '管理员')

const menuItems = [
  { title: '仪表盘', icon: 'mdi-view-dashboard', to: '/dashboard' },
  { title: '经营主体', icon: 'mdi-store', to: '/entities' },
  { title: '许可备案', icon: 'mdi-card-account-details', to: '/licenses' },
  { title: '照片管理', icon: 'mdi-image-multiple', to: '/photos' },
  { title: '监督检查', icon: 'mdi-clipboard-check', to: '/inspections' },
  { title: '检查计划', icon: 'mdi-calendar-check', to: '/inspection-plans' },
  { title: '检查模板', icon: 'mdi-file-document', to: '/inspection-templates' },
  { title: '风险排查', icon: 'mdi-alert-circle', to: '/screenings' },
  { title: '投诉举报', icon: 'mdi-phone', to: '/complaints' },
  { title: '整改管理', icon: 'mdi-wrench', to: '/rectifications' },
  { title: '社会共治', icon: 'mdi-account-group', to: '/activities' },
  { title: '活动分析', icon: 'mdi-chart-pie', to: '/activities-stats' },
  { title: '自查自纠', icon: 'mdi-checkbox-marked', to: '/self-inspections' },
  { title: '信息更正', icon: 'mdi-pencil-circle', to: '/info-corrections' },
  { title: '意见反馈', icon: 'mdi-message-draw', to: '/feedback' },
  { title: '消息通知', icon: 'mdi-bell', to: '/notifications' },
  { title: '统计报表', icon: 'mdi-chart-bar', to: '/reports' },
  { title: '用户管理', icon: 'mdi-account', to: '/users' },
  { title: '街道管理', icon: 'mdi-map-marker', to: '/streets' },
  { title: '二维码管理', icon: 'mdi-qrcode', to: '/qrcodes' },
  { title: '扫码记录', icon: 'mdi-qrcode-scan', to: '/qr-scans' },
  { title: '审计日志', icon: 'mdi-history', to: '/audit-logs' },
]

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  router.push('/login')
}
</script>

<style scoped>
.v-navigation-drawer { border-right: 1px solid #e2e8f0 !important; }
.v-app-bar { box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important; }

/* 1366x768 及以上适配 */
.v-data-table { font-size: 13px; }
:deep(.v-data-table__tr) { height: 40px; }
@media (max-width: 1366px) {
  .v-card-title { font-size: 1rem !important; }
}</style>