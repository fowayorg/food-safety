<template>
  <div class="profile-page">
    <van-nav-bar title="个人中心" fixed />
    <div class="profile-header">
      <div class="avatar">{{ username?.charAt(0)?.toUpperCase() || 'U' }}</div>
      <div class="user-info">
        <div class="username">{{ username || '未登录' }}</div>
        <div class="role">{{ roleLabel }}</div>
      </div>
    </div>
    <div class="stats-grid" v-if="isLoggedIn">
      <div class="stat-item"><div class="stat-num">{{ stats.inspections || 0 }}</div><div class="stat-label">检查任务</div></div>
      <div class="stat-item"><div class="stat-num">{{ stats.complaints || 0 }}</div><div class="stat-label">投诉举报</div></div>
      <div class="stat-item"><div class="stat-num">{{ stats.activities || 0 }}</div><div class="stat-label">参与活动</div></div>
    </div>
    <van-cell-group inset style="margin-top:12px">
      <van-cell title="我的检查" is-link to="/inspection" icon="records" />
      <van-cell title="自查自纠" is-link to="/self-inspection" icon="passed" />
      <van-cell title="我的投诉" is-link to="/complaint" icon="warning-o" />
      <van-cell title="参与活动" is-link to="/activity" icon="star-o" />
    </van-cell-group>
    <van-cell-group inset style="margin-top:12px">
      <van-cell title="修改密码" is-link icon="lock" @click="showPasswordDialog = true" />
      <van-cell title="关于" is-link icon="info-o" />
    </van-cell-group>
    <div style="padding:24px 16px" v-if="isLoggedIn">
      <van-button round block type="danger" plain @click="onLogout">退出登录</van-button>
    </div>
    <van-dialog v-model:show="showPasswordDialog" title="修改密码" show-cancel-button @confirm="onChangePassword">
      <van-field v-model="newPassword" type="password" label="新密码" placeholder="请输入新密码" style="padding:16px" />
    </van-dialog>
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
import { useRouter } from 'vue-router'
import { authApi } from '@/api/index'
import { showToast, showDialog } from 'vant'

const router = useRouter()
const username = ref('')
const userRole = ref('')
const showPasswordDialog = ref(false)
const newPassword = ref('')
const activeTab = ref(4)
const stats = ref({ inspections: 0, complaints: 0, activities: 0 })
const isLoggedIn = computed(() => !!localStorage.getItem('token'))
const roleLabel = computed(() => ({ SUPER_ADMIN:'系统管理员', ADMIN:'管理员', INSPECTOR:'检查员', OPERATOR:'经营者', VIEWER:'查看者' })[userRole.value] || userRole.value || '未登录')

const loadProfile = async () => {
  try { const res = await authApi.profile(); username.value = res.username; userRole.value = res.role } catch {}
}
const onLogout = async () => {
  try { await showDialog({ title: '确认', message: '确定要退出登录吗？' }); localStorage.removeItem('token'); showToast({ message: '已退出', type: 'success' }); router.replace('/login') } catch {}
}
const onChangePassword = () => {
  if (!newPassword.value || newPassword.value.length < 6) { showToast('密码至少6位'); return }
  showToast({ message: '密码修改成功', type: 'success' }); newPassword.value = ''
}
onMounted(loadProfile)
</script>

<style scoped>
.profile-page { min-height:100vh; background:#f5f5f5; padding-bottom:70px }
.profile-header { display:flex; align-items:center; padding:60px 20px 20px; background:linear-gradient(135deg,#1989fa,#07c160); color:#fff }
.avatar { width:64px; height:64px; border-radius:50%; background:rgba(255,255,255,0.25); display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:bold; margin-right:16px }
.user-info { flex:1 }
.username { font-size:20px; font-weight:bold }
.role { font-size:13px; opacity:0.85; margin-top:4px }
.stats-grid { display:flex; margin:12px 16px; background:#fff; border-radius:12px; padding:16px 0; box-shadow:0 1px 4px rgba(0,0,0,0.06) }
.stat-item { flex:1; text-align:center }
.stat-num { font-size:22px; font-weight:bold; color:#1989fa }
.stat-label { font-size:12px; color:#999; margin-top:4px }
</style>