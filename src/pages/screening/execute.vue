<template>
  <div class="screening-execute-page">
    <van-nav-bar title="排查执行" left-arrow @click-left="router.back()" fixed />

    <van-loading v-if="loading" class="loading" />
    <van-empty v-else-if="!entity" description="请先扫描主体二维码" />

    <div v-else class="execute-content">
      <!-- 主体信息 -->
      <div class="entity-info">
        <div class="entity-name">{{ entity.name }}</div>
        <div class="entity-address">{{ entity.address }}</div>
        <van-tag :type="entityTypeTag">{{ entityTypeLabel }}</van-tag>
      </div>

      <!-- 信息核实 -->
      <van-cell-group inset title="信息核实">
        <van-cell title="营业执照信息" :value="form.infoVerified ? '已核实' : '待核实'" />
        <van-field name="infoVerified" label="信息是否属实">
          <template #input>
            <van-switch v-model="form.infoVerified" />
          </template>
        </van-field>
      </van-cell-group>

      <!-- 风险等级判定 -->
      <van-cell-group inset title="风险等级判定">
        <van-radio-group v-model="form.riskLevel" direction="horizontal">
          <van-radio name="LOW">低风险</van-radio>
          <van-radio name="LOWER">较低风险</van-radio>
          <van-radio name="MEDIUM">中等风险</van-radio>
          <van-radio name="HIGHER">较高风险</van-radio>
          <van-radio name="HIGH">高风险</van-radio>
        </van-radio-group>
      </van-cell-group>

      <!-- 问题记录 -->
      <van-cell-group inset title="发现问题">
        <van-field
          v-model="form.issues"
          type="textarea"
          placeholder="记录发现的问题..."
          rows="3"
          autosize
        />
      </van-cell-group>

      <!-- 现场照片 -->
      <van-cell-group inset title="现场照片">
        <van-uploader v-model="photoList" multiple :max-count="5" @delete="onPhotoDelete" />
      </van-cell-group>

      <!-- 备注 -->
      <van-cell-group inset title="备注">
        <van-field
          v-model="form.notes"
          type="textarea"
          placeholder="其他备注信息..."
          rows="2"
          autosize
        />
      </van-cell-group>

      <!-- 提交按钮 -->
      <div class="submit-row">
        <van-button type="primary" block round :loading="submitting" @click="handleSubmit">
          提交排查结果
        </van-button>
      </div>
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
import { showToast, showSuccessToast, showFailToast } from 'vant'
import { screeningsApi, entitiesApi } from '@/api/index'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const submitting = ref(false)
const entity = ref(null)
const activeTab = ref(0)

const form = ref({
  entityId: '',
  planId: '',
  infoVerified: false,
  riskLevel: 'LOW',
  issues: '',
  photos: '',
  notes: '',
})

const photoList = ref([])

const entityTypeMap = {
  RESTAURANT: { label: '餐饮店', tag: 'primary' },
  SUPERMARKET: { label: '超市', tag: 'success' },
  CONVENIENCE: { label: '便利店', tag: 'warning' },
  WORKSHOP: { label: '加工厂', tag: 'danger' },
  WHOLESALE: { label: '批发部', tag: '' },
}

const entityTypeLabel = computed(() => entityTypeMap[entity.value?.type]?.label || '未知')
const entityTypeTag = computed(() => entityTypeMap[entity.value?.type]?.tag || 'default')

// 加载主体信息
async function loadEntity(entityId) {
  loading.value = true
  try {
    const res = await entitiesApi.getPublicInfo(entityId)
    entity.value = res.data
    form.value.entityId = entityId
  } catch (e) {
    showFailToast('加载主体信息失败')
  } finally {
    loading.value = false
  }
}

// 照片删除
function onPhotoDelete(file) {
  const index = photoList.value.findIndex(f => f.url === file.url)
  if (index > -1) photoList.value.splice(index, 1)
}

// 提交排查结果
async function handleSubmit() {
  if (!form.value.infoVerified) {
    showToast('请先核实信息')
    return
  }
  if (!form.value.riskLevel) {
    showToast('请选择风险等级')
    return
  }

  submitting.value = true
  try {
    // 处理照片（实际项目中需要上传到服务器）
    form.value.photos = photoList.value.map(p => p.url || p.content).filter(Boolean).join(',')

    await screeningsApi.create(form.value)
    showSuccessToast('排查记录提交成功')
    router.back()
  } catch (e) {
    showFailToast(e.response?.data?.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  const entityId = route.query.entityId
  const planId = route.query.planId
  if (entityId) {
    loadEntity(entityId)
    if (planId) form.value.planId = planId
  } else {
    showFailToast('缺少主体ID参数')
  }
})
</script>

<style scoped>
.screening-execute-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 100px 0;
}

.execute-content {
  padding: 56px 16px 16px;
}

.entity-info {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.entity-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.entity-address {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.submit-row {
  margin-top: 24px;
}

:deep(.van-cell-group) {
  margin-bottom: 16px;
}

:deep(.van-radio-group) {
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
