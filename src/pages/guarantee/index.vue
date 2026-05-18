<template>
  <div class="detail-page">
    <van-nav-bar title="两个责任" left-arrow @click-left="router.back()" fixed />
    <van-loading v-if="loading" class="loading" />
    <van-empty v-else-if="!entity" description="主体不存在" />
    <div v-else class="content">
      <van-cell-group inset title="主体信息">
        <van-cell title="主体名称" :value="entity.name" />
        <van-cell title="统一社会信用代码" :value="entity.creditCode" />
        <van-cell title="法定代表人" :value="entity.legalPerson" />
      </van-cell-group>

      <van-cell-group inset title="两个责任">
        <van-cell title="包保等级">
          <template #value>
            <van-tag :type="getGuaranteeLevelTag(entity.guaranteeLevel)" size="medium">
              {{ getGuaranteeLevelLabel(entity.guaranteeLevel) }}
            </van-tag>
          </template>
        </van-cell>
        <van-cell title="食品安全总监" :value="entity.safetyDirector || '-'" />
        <van-cell title="食品安全员" :value="entity.safetyOfficer || '-'" />
        <van-cell title="包保干部" :value="entity.guaranteeCadre || '-'" />
        <van-cell title="包保干部职务" :value="entity.guaranteeCadreTitle || '-'" />
      </van-cell-group>

      <van-cell-group v-if="entity.guaranteeLevel" inset title="等级说明">
        <div class="level-desc">
          <p v-if="entity.guaranteeLevel === 'A'">
            <b>A级（最高等级）</b>：对应市级领导包保，一般为大型食品生产经营企业。
          </p>
          <p v-else-if="entity.guaranteeLevel === 'B'">
            <b>B级（较高等级）</b>：对应区级领导包保，一般为中型食品生产经营企业。
          </p>
          <p v-else-if="entity.guaranteeLevel === 'C'">
            <b>C级（一般等级）</b>：对应镇街级领导包保，一般为小型食品生产经营企业。
          </p>
          <p v-else-if="entity.guaranteeLevel === 'D'">
            <b>D级（基础等级）</b>：对应村社区级包保，一般为小作坊、小餐饮。
          </p>
          <p v-else>
            暂未确定包保等级
          </p>
        </div>
      </van-cell-group>

      <van-cell-group v-if="entity.riskLevel" inset title="风险等级">
        <van-cell title="风险等级">
          <template #value>
            <van-tag :type="getRiskLevelTag(entity.riskLevel)" size="medium">
              {{ getRiskLevelLabel(entity.riskLevel) }}
            </van-tag>
          </template>
        </van-cell>
        <van-cell title="风险评分" :value="entity.riskScore || 0" />
        <van-cell title="评定日期" :value="formatDate(entity.riskRatedAt)" />
      </van-cell-group>

      <div class="action-row" v-if="isOperator">
        <van-button type="primary" block round @click="showEditDialog = true">
          申请修改信息
        </van-button>
      </div>
    </div>

    <van-dialog v-model:show="showEditDialog" title="申请修改" show-cancel-button @confirm="handleApply">
      <van-cell-group :border="false">
        <van-field v-model="applyReason" rows="3" type="textarea" placeholder="请输入申请修改的原因" maxlength="200" show-word-limit />
      </van-cell-group>
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
import { useRouter, useRoute } from 'vue-router'
import { entitiesApi } from '@/api/index'
import { infoCorrectionsApi } from '@/api/index'
import { showToast, showSuccessToast } from 'vant'

const router = useRouter()
const route = useRoute()
const activeTab = ref(0)
const loading = ref(true)
const entity = ref(null)
const showEditDialog = ref(false)
const applyReason = ref('')

const isOperator = computed(() => {
  const profile = JSON.parse(localStorage.getItem('profile') || '{}')
  return profile.role === 'OPERATOR'
})

onMounted(async () => {
  const id = route.params.id
  if (!id) { showToast({ message: '缺少主体ID' }); router.back(); return }
  try {
    const res = await entitiesApi.getPublic(id)
    entity.value = res.data || res
  } catch { showToast({ message: '加载失败' }) }
  finally { loading.value = false }
})

const handleApply = async () => {
  if (!applyReason.value.trim()) { showToast({ message: '请输入申请原因' }); return }
  try {
    await infoCorrectionsApi.create({
      entityId: entity.value.id,
      field: 'guaranteeLevel',
      oldValue: entity.value.guaranteeLevel || '',
      newValue: '',
      reason: applyReason.value.trim()
    })
    showSuccessToast({ message: '申请已提交' })
    showEditDialog.value = false
    applyReason.value = ''
  } catch (e) {
    showToast({ message: e?.response?.data?.message || '提交失败' })
  }
}

const formatDate = (date) => date ? new Date(date).toLocaleDateString('zh-CN') : '-'

const getGuaranteeLevelLabel = (level) => ({ A: 'A级', B: 'B级', C: 'C级', D: 'D级' }[level] || '未评级')
const getGuaranteeLevelTag = (level) => ({ A: 'danger', B: 'warning', C: 'primary', D: 'default' }[level] || 'default')
const getRiskLevelLabel = (level) => ({ UNRATED: '未评级', LOW: '低风险', LOWER: '较低风险', MEDIUM: '中等风险', HIGHER: '较高风险', HIGH: '高风险' }[level] || level)
const getRiskLevelTag = (level) => ({ UNRATED: 'default', LOW: 'success', LOWER: 'primary', MEDIUM: 'warning', HIGHER: 'danger', HIGH: 'danger' }[level] || 'default')
</script>

<style scoped>
.detail-page { min-height:100vh; background:#f5f5f5; padding-top:46px; padding-bottom:70px }
.loading { display:flex; justify-content:center; padding:60px 0 }
.content { padding:12px 0 }
.level-desc { padding:16px; font-size:14px; color:#666; line-height:1.8 }
.level-desc p { margin:0 0 8px }
.action-row { margin:20px 16px }
</style>
