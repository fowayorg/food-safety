<template>
  <div class="info-correction-detail-page">
    <van-nav-bar title="申请详情" left-arrow @click-left="router.back()" fixed />

    <van-loading v-if="loading" class="loading" />
    <van-empty v-else-if="!record" description="记录不存在" />

    <div v-else class="detail-content">
      <van-cell-group inset title="主体信息">
        <van-cell title="经营主体" :value="record.entity?.name" />
        <van-cell title="更正字段" :value="fieldLabelMap[record.fieldName] || record.fieldName" />
      </van-cell-group>

      <van-cell-group inset title="更正内容">
        <van-cell title="原值">
          <template #value>
            <span class="old-value">{{ record.oldValue || '-' }}</span>
          </template>
        </van-cell>
        <van-cell title="新值">
          <template #value>
            <span class="new-value">{{ record.newValue }}</span>
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group inset title="申请信息">
        <van-cell title="更正原因" :value="record.reason" />
        <van-cell title="联系电话" :value="record.submitterPhone || '-'" />
        <van-cell title="申请时间" :value="formatTime(record.createdAt)" />
        <van-cell title="状态">
          <template #value>
            <van-tag :type="statusTagMap[record.status]">{{ statusLabelMap[record.status] }}</van-tag>
          </template>
        </van-cell>
      </van-cell-group>

      <van-cell-group v-if="record.reviewRemark" inset title="审核意见">
        <div class="review-content">{{ record.reviewRemark }}</div>
      </van-cell-group>

      <van-cell-group v-if="photos.length" inset title="证明材料">
        <div class="photos-grid">
          <img v-for="(photo, i) in photos" :key="i" :src="photo" class="photo-item" @click="previewPhoto(i)" />
        </div>
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
import { infoCorrectionsApi } from '@/api/index'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const record = ref(null)
const activeTab = ref(0)

const statusLabelMap = {
  PENDING: '待审核',
  APPROVED: '已通过',
  REJECTED: '已驳回',
}

const statusTagMap = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
}

const fieldLabelMap = {
  name: '主体名称',
  address: '地址',
  legalPerson: '法定代表人',
  phone: '联系电话',
  businessScope: '经营范围',
}

const photos = computed(() => {
  if (!record.value?.evidence) return []
  return record.value.evidence.split(',').filter(Boolean)
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
    const res = await infoCorrectionsApi.get(id)
    record.value = res.data
  } catch (e) {
    console.error('加载失败', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRecord()
})
</script>

<style scoped>
.info-correction-detail-page {
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

.old-value {
  text-decoration: line-through;
  color: #999;
}

.new-value {
  color: #1976d2;
}

.review-content {
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.6;
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
