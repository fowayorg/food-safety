<template>
  <div class="exec-page">
    <van-nav-bar title="整改详情" left-arrow @click-left="router.back()" fixed />

    <div v-if="loading" class="loading-wrap">
      <van-loading size="24px">加载中...</van-loading>
    </div>

    <div v-else-if="item" class="exec-content">
      <!-- 整改信息 -->
      <div class="info-card">
        <div class="info-title">整改要求</div>
        <div class="info-row">
          <van-tag :type="getStatusType(item.status)">{{ getStatusLabel(item.status) }}</van-tag>
          <van-tag v-if="item.level" type="warning">风险等级：{{ getLevelLabel(item.level) }}</van-tag>
        </div>
        <div class="info-desc">{{ item.description || '暂无描述' }}</div>
        <div class="info-deadline" v-if="item.deadline">
          截止日期：{{ formatDate(item.deadline) }}
          <span v-if="isOverdue" class="overdue-tip">已逾期</span>
        </div>
      </div>

      <!-- 关联检查记录 -->
      <div class="info-card" v-if="item.record">
        <div class="info-title">关联检查记录</div>
        <div class="record-info">
          <div>检查类型：{{ item.record.inspectionType || item.record.type || '-' }}</div>
          <div>检查时间：{{ item.record.inspectionDate ? formatDate(item.record.inspectionDate) : '-' }}</div>
          <div>检查结果：{{ item.record.result || '-' }}</div>
          <div v-if="item.record.notes">问题描述：{{ item.record.notes }}</div>
        </div>
      </div>

      <!-- 整改提交（仅 PENDING/REJECTED 可提交） -->
      <div class="info-card" v-if="canSubmit">
        <div class="info-title">提交整改结果</div>
        <van-field
          v-model="submitDescription"
          label="整改说明"
          type="textarea"
          placeholder="请描述已完成整改的内容"
          rows="3"
          maxlength="500"
          show-word-limit
        />
        <div class="photo-section">
          <div class="photo-label">整改照片（最多4张）</div>
          <van-uploader v-model="submitPhotos" :max-count="4" :after-read="afterPhotoRead" />
        </div>
        <van-button type="primary" block round :loading="submitting" @click="handleSubmit" class="submit-btn">
          提交整改
        </van-button>
      </div>

      <!-- 已提交状态查看 -->
      <div class="info-card" v-if="item.status === 'SUBMITTED'">
        <div class="info-title">已提交内容</div>
        <div class="info-desc">{{ item.submitDescription || '无' }}</div>
        <div class="submit-time" v-if="item.submittedAt">提交时间：{{ formatDate(item.submittedAt) }}</div>
        <div class="photo-preview" v-if="item.submitPhotos?.length">
          <van-image
            v-for="(url, idx) in item.submitPhotos"
            :key="idx"
            :src="url"
            width="80"
            height="80"
            fit="cover"
            style="border-radius:4px;margin-right:8px"
          />
        </div>
      </div>

      <!-- 审核结果 -->
      <div class="info-card" v-if="item.status === 'APPROVED' || item.status === 'REJECTED'">
        <div class="info-title">审核结果</div>
        <van-result
          :picon="item.status === 'APPROVED' ? 'passed' : 'warning'"
          :title="item.status === 'APPROVED' ? '整改已通过' : '整改未通过'"
          :desc="item.reviewRemark || (item.status === 'APPROVED' ? '恭喜！整改内容已通过审核' : '请根据驳回原因重新整改')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { rectificationsApi } from '@/api/index'
import { showToast, showSuccessToast } from 'vant'

const route = useRoute()
const router = useRouter()
const item = ref(null)
const loading = ref(true)
const submitting = ref(false)
const submitDescription = ref('')
const submitPhotos = ref([])

const id = route.params.id

const canSubmit = computed(() => {
  return item.value && (item.value.status === 'PENDING' || item.value.status === 'REJECTED')
})

const isOverdue = computed(() => {
  if (!item.value?.deadline) return false
  return new Date(item.value.deadline) < new Date()
})

onMounted(() => {
  loadData()
})

const loadData = async () => {
  try {
    item.value = await rectificationsApi.get(id)
    if (item.value?.submitDescription) submitDescription.value = item.value.submitDescription
    if (item.value?.submitPhotos) submitPhotos.value = item.value.submitPhotos.map(u => ({ url: u }))
  } catch (e) {
    showToast('加载整改详情失败')
  } finally {
    loading.value = false
  }
}

const afterPhotoRead = (file) => {
  // 实际场景：上传到七牛/OSS后替换 url
  // 这里做 base64 简单处理，或直接使用本地临时 URL
  file.status = 'done'
}

const handleSubmit = async () => {
  if (!submitDescription.value.trim()) {
    showToast('请填写整改说明')
    return
  }
  try {
    submitting.value = true
    const photos = submitPhotos.value.map(f => f.url || f)
    await rectificationsApi.submit(id, {
      submitDescription: submitDescription.value,
      submitPhotos: photos,
    })
    showSuccessToast('整改已提交，等待审核')
    router.back()
  } catch (e) {
    showToast(e.response?.data?.message || '提交失败')
  } finally {
    submitting.value = false
  }
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
.exec-page { min-height: 100vh; background: #f5f5f5; padding-top: 46px; padding-bottom: 20px; }
.loading-wrap { display: flex; justify-content: center; padding: 60px 0; }
.info-card { background: #fff; margin: 12px; border-radius: 8px; padding: 16px; }
.info-title { font-weight: bold; font-size: 15px; color: #333; margin-bottom: 10px; }
.info-row { display: flex; gap: 8px; margin-bottom: 8px; }
.info-desc { font-size: 14px; color: #666; line-height: 1.5; margin: 8px 0; }
.info-deadline { font-size: 13px; color: #999; margin-top: 6px; }
.overdue-tip { color: #f56c6c; margin-left: 8px; font-weight: bold; }
.record-info { font-size: 13px; color: #666; line-height: 1.8; }
.photo-section { margin-top: 12px; }
.photo-label { font-size: 13px; color: #999; margin-bottom: 8px; }
.submit-btn { margin-top: 16px; }
.submit-time { font-size: 12px; color: #999; margin-top: 8px; }
.photo-preview { margin-top: 10px; display: flex; flex-wrap: wrap; }
</style>
