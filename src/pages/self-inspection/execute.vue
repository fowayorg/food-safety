<template>
  <div class="execute-page">
    <van-nav-bar title="执行自查" left-arrow @click-left="router.back()" fixed />
    <van-loading v-if="loading" class="loading" />
    <van-empty v-else-if="!inspection" description="自查任务不存在" />
    <div v-else class="content">
      <div class="entity-info">
        <div class="entity-name">{{ inspection.entity?.name }}</div>
        <van-tag :type="inspection.status === 'SUBMITTED' ? 'success' : 'warning'">
          {{ inspection.status === 'SUBMITTED' ? '已提交' : '待自查' }}
        </van-tag>
      </div>
      <van-cell-group inset title="自查项目">
        <div v-for="(item, i) in checklist" :key="i" class="check-item">
          <div class="check-title">{{ i+1 }}. {{ item.name }}</div>
          <van-radio-group v-model="item.result" direction="horizontal">
            <van-radio name="PASS">✅ 合格</van-radio>
            <van-radio name="FAIL">❌ 不合格</van-radio>
          </van-radio-group>
        </div>
      </van-cell-group>
      <van-cell-group inset title="备注">
        <van-field v-model="remark" type="textarea" placeholder="请输入备注..." rows="3" autosize />
      </van-cell-group>
      <div class="submit-row">
        <van-button type="primary" block round :loading="submitting" @click="handleSubmit">
          提交自查结果
        </van-button>
      </div>
    </div>
    <van-tabbar v-model="activeTab" route fixed placeholder>
      <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item><van-tabbar-item to="/inspection" icon="records">检查</van-tabbar-item>
      <van-tabbar-item to="/complaint" icon="warning-o">投诉</van-tabbar-item><van-tabbar-item to="/notification" icon="bell">消息</van-tabbar-item>
      <van-tabbar-item to="/profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { selfInspectionsApi } from '@/api/index'
import { showToast, showSuccessToast, showFailToast } from 'vant'
const router = useRouter(); const route = useRoute()
const activeTab = ref(0); const loading = ref(true); const submitting = ref(false)
const inspection = ref(null); const remark = ref('')
const checklist = ref([])
onMounted(async () => {
  const id = route.params.id
  if (!id) { showFailToast('缺少ID'); router.back(); return }
  try {
    const res = await selfInspectionsApi.get(id)
    inspection.value = res.data || res
    checklist.value = (inspection.value.items || inspection.value.template?.items || [
      { name: '证照公示' }, { name: '环境卫生' }, { name: '食品储存' }, { name: '加工操作' }, { name: '人员健康' }, { name: '餐具消毒' }, { name: '索证索票' }, { name: '食品留样' }
    ]).map(i => ({ ...i, result: 'PASS' }))
  } catch { showToast({ message: '加载失败' }) }
  finally { loading.value = false }
})
const handleSubmit = async () => {
  submitting.value = true
  try {
    await selfInspectionsApi.submit(inspection.value.id)
    showSuccessToast({ message: '提交成功', onClose: () => router.replace('/self-inspection') })
  } catch { showFailToast({ message: '提交失败' }) }
  finally { submitting.value = false }
}
</script>
<style scoped>
.execute-page { min-height:100vh; background:#f5f5f5; padding-top:46px; padding-bottom:70px }
.loading { display:flex; justify-content:center; padding:60px 0 }
.content { padding:12px 0 }
.entity-info { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; background:#fff; margin:0 16px 12px; border-radius:12px }
.entity-name { font-size:16px; font-weight:bold; color:#333 }
.check-item { padding:12px 16px; border-bottom:1px solid #f0f0f0 }
.check-title { font-size:14px; color:#333; margin-bottom:10px }
.submit-row { margin:20px 16px }
</style>
