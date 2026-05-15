<template>
  <div class="screening-detail-page">
    <van-nav-bar title="排查详情" left-arrow @click-left="router.back()" fixed />

    <van-loading v-if="loading" class="loading" />
    <van-empty v-else-if="!record" description="排查记录不存在" />

    <div v-else class="detail-content">
      <!-- 主体信息 -->
      <van-cell-group inset title="经营主体">
        <van-cell title="名称" :value="record.entity?.name" />
        <van-cell title="地址" :value="record.entity?.address" />
        <van-cell title="类型" :value="entityTypeLabel" />
      </van-cell-group>

      <!-- 排查结果 -->
      <van-cell-group inset title="排查结果">
        <van-cell title="信息核实" :value="record.infoVerified ? '已核实' : '未核实'" />
        <van-cell title="风险等级">
          <template #value>
            <van-tag :type="riskTagMap[record.riskLevel]">{{ riskLabelMap[record.riskLevel] }}</van-tag>
          </template>
        </van-cell>
        <van-cell title="排查时间" :value="formatTime(record.screenedAt || record.createdAt)" />
        <van-cell title="排查员" :value="record.screener?.realName || record.screener?.username" />
      </van-cell-group>

      <!-- 问题记录 -->
      <van-cell-group v-if="record.issues" inset title="发现问题">
        <div class="issues-content">{{ record.issues }}</div>
      </van-cell-group>

      <!-- 现场照片 -->
      <van-cell-group v-if="photos.length" inset title="现场照片">
        <div class="photos-grid">
          <img v-for="(photo, i) in photos" :key="i" :src="photo" class="photo-item" @click="previewPhoto(i)" />
        </div>
      </van-cell-group>

      <!-- 备注 -->
      <van-cell-group v-if="record.notes" inset title="备注">
        <div class="notes-content">{{ record.notes }}</div>
      </van-cell-group>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showImagePreview } from 'vant'
import { screeningsApi } from '@/api/index'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const record = ref(null)
const activeTab = ref(0)

const riskLabelMap = {
  LOW: '低风险',
  LOWER: '较低风险',
  MEDIUM: '中等风险',
  HIGHER: '较高风险',
  HIGH: '高风险',
  UNRATED: '未评级',
}

const riskTagMap = {
  LOW: 'success',
  LOWER: 'primary',
  MEDIUM: 'warning',
  HIGHER: 'danger',
  HIGH: 'danger',
  UNRATED: 'default',
}

const entityTypeMap = {
  RESTAURANT: '餐饮店',
  SUPERMARKET: '超市',
  CONVENIENCE: '便利店',
  WORKSHOP: '加工厂',
  WHOLESALE: '批发部',
}

const entityTypeLabel = computed(() => entityTypeMap[record.value?.entity?.type] || '未知')

const photos = computed(() => {
  if (!record.value?.photos) return []
  return record.value.photos.split(',').filter(Boolean)
})

function formatTime(time) {
  if (!time) return ''
  const d = new Date(time)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

function previewPhoto(index) {
  showImagePreview({ images: photos.value, startPosition: index })
}

async function loadRecord() {
  const id = route.params.id
  if (!id) return

  loading.value = true
  try {
    const res = await screeningsApi.get(id)
    record.value = res.data
  } catch (e) {
    console.error('加载排查记录失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRecord()
})
</script>

<style scoped>
.screening-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 100px 0;
}

.detail-content {
  padding: 56px 16px 16px;
}

:deep(.van-cell-group) {
  margin-bottom: 16px;
}

.issues-content,
.notes-content {
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 12px;
}

.photo-item {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
}
</style>
