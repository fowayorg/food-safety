<template>
  <div class="execute-page">
    <van-nav-bar title="执行检查" left-arrow @click-left="router.back()" fixed />

    <van-loading v-if="loading" class="loading" />
    <van-empty v-else-if="!inspection" description="检查任务不存在" />

    <div v-else class="execute-content">
      <!-- 主体信息 -->
      <div class="entity-info">
        <div class="entity-name">{{ inspection.entity?.name }}</div>
        <van-tag :type="statusTagType">{{ statusLabel }}</van-tag>
      </div>

      <!-- 检查项目 -->
      <van-cell-group inset title="检查项目">
        <div v-for="(item, index) in checklist" :key="index" class="check-item">
          <div class="check-title">{{ index + 1 }}. {{ item.content || item.name }}</div>
          <van-radio-group v-model="item.result" direction="horizontal">
            <van-radio name="PASS">✅ 合格</van-radio>
            <van-radio name="FAIL">❌ 不合格</van-radio>
            <van-radio name="N/A">⚪ 不适用</van-radio>
          </van-radio-group>
        </div>
      </van-cell-group>

      <!-- 备注 -->
      <van-cell-group inset title="备注">
        <van-field
          v-model="remark"
          type="textarea"
          placeholder="请输入备注信息..."
          rows="3"
          autosize
        />
      </van-cell-group>

      <!-- 提交按钮 -->
      <div class="submit-row">
        <van-button type="primary" block round :loading="submitting" @click="handleSubmit">
          提交检查结果
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
import { inspectionsApi } from '@/api/index'
import { showToast, showSuccessToast, showFailToast, showDialog } from 'vant'

const router = useRouter()
const route = useRoute()
const activeTab = ref(1)
const loading = ref(true)
const submitting = ref(false)
const inspection = ref(null)
const remark = ref('')
const checklist = ref([])

const statusLabel = computed(() => {
  const map = { PENDING: '待检查', IN_PROGRESS: '进行中', COMPLETED: '已完成' }
  return map[inspection.value?.status] || inspection.value?.status || ''
})

const statusTagType = computed(() => {
  const map = { PENDING: 'warning', IN_PROGRESS: 'primary', COMPLETED: 'success' }
  return map[inspection.value?.status] || 'default'
})

onMounted(async () => {
  const id = route.params.id
  if (!id) {
    showFailToast('缺少检查ID')
    router.back()
    return
  }

  try {
    const res = await inspectionsApi.get(id)
    inspection.value = res.data || res

    // 生成检查清单（默认模板项目）
    const template = inspection.value.template
    if (template?.items) {
      checklist.value = template.items.map(item => ({ ...item, result: 'PASS' }))
    } else {
      // 默认检查项目
      checklist.value = [
        { content: '证照公示', result: 'PASS' },
        { content: '环境卫生', result: 'PASS' },
        { content: '食品储存', result: 'PASS' },
        { content: '加工操作', result: 'PASS' },
        { content: '人员健康', result: 'PASS' },
        { content: '餐具消毒', result: 'PASS' },
        { content: '索证索票', result: 'PASS' },
        { content: '食品留样', result: 'PASS' },
      ]
    }
  } catch (e) {
    showToast({ message: '加载失败' })
  } finally {
    loading.value = false
  }
})

const handleSubmit = async () => {
  const unchecked = checklist.value.filter(i => !i.result)
  if (unchecked.length > 0) {
    showToast({ message: '请完成所有检查项目' })
    return
  }

  try {
    await showDialog({
      title: '确认提交',
      message: '提交后将无法修改检查结果，是否确认提交？',
      showCancelButton: true,
      confirmButtonText: '确认提交',
    })
  } catch {
    return
  }

  submitting.value = true
  try {
    const results = checklist.value.map(item => ({
      itemId: item.id,
      itemName: item.content || item.name,
      result: item.result,
    }))

    await inspectionsApi.update(inspection.value.id, {
      status: 'COMPLETED',
      remark: remark.value,
      results,
      completedAt: new Date().toISOString(),
    })

    showSuccessToast({ message: '提交成功', onClose: () => router.replace('/inspection') })
  } catch (e) {
    showFailToast({ message: '提交失败' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.execute-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 46px;
  padding-bottom: 70px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.execute-content {
  padding: 12px 0;
}

.entity-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  margin: 0 16px 12px;
  border-radius: 12px;
}

.entity-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.check-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.check-item:last-child {
  border-bottom: none;
}

.check-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
}

.submit-row {
  margin: 20px 16px;
}
</style>
