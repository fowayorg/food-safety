<template>
  <div class="entity-detail-page">
    <van-nav-bar title="主体详情" left-arrow @click-left="router.back()" fixed />
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div v-if="entity" class="entity-content">
        <!-- 基本信息 -->
        <van-cell-group inset style="margin-top:56px">
          <van-cell title="主体名称" :value="entity.name" />
          <van-cell title="统一社会信用代码" :value="entity.creditCode" />
          <van-cell title="主体类型">
            <template #value><van-tag type="primary">{{ getTypeLabel(entity.type) }}</van-tag></template>
          </van-cell>
          <van-cell title="法人" :value="entity.legalPerson || '-'" />
          <van-cell title="地址" :value="entity.address" />
          <van-cell title="经营范围" :value="entity.businessScope || '-'" />
          <van-cell title="风险等级">
            <template #value><van-tag :type="getRiskTagType(entity.riskLevel)">{{ getRiskLabel(entity.riskLevel) }}</van-tag></template>
          </van-cell>
          <van-cell title="安全等级">
            <template #value><van-tag :type="getGuaranteeTagType(entity.guaranteeLevel)">{{ getGuaranteeLabel(entity.guaranteeLevel) }}</van-tag></template>
          </van-cell>
        </van-cell-group>

        <!-- 两个责任 -->
        <div class="section-title">两个责任</div>
        <van-cell-group inset>
          <van-cell title="食品安全总监" :value="entity.safetyDirector || '未设置'" />
          <van-cell title="食品安全员" :value="entity.safetyOfficer || '未设置'" />
          <van-cell title="包保干部" :value="entity.guaranteeCadre || '未设置'" />
          <van-cell title="包保干部职务" :value="entity.guaranteeCadreTitle || '-'" />
        </van-cell-group>

        <!-- 证照信息 -->
        <div v-if="entity.licenses && entity.licenses.length" style="margin-top:12px">
          <div class="section-title">证照信息</div>
          <van-cell-group inset>
            <van-cell v-for="lic in entity.licenses" :key="lic.id" :title="getLicenseLabel(lic.licenseType)" :label="lic.licenseNo" :value="`${lic.validFrom?.slice(0,10)} ~ ${lic.validTo?.slice(0,10)}`" />
          </van-cell-group>
        </div>

        <!-- 精彩照片 -->
        <div v-if="entity.photos && entity.photos.length" style="margin-top:12px">
          <div class="section-title">精彩照片</div>
          <div class="photo-grid">
            <van-image v-for="photo in entity.photos" :key="photo.id" :src="photo.url" fit="cover" width="100" height="100" radius="8" @click="previewPhoto(photo.url)" />
          </div>
        </div>

        <!-- 检查记录 -->
        <div v-if="entity.inspectionRecords && entity.inspectionRecords.length" style="margin-top:12px">
          <div class="section-title">检查记录</div>
          <van-cell-group inset>
            <van-cell
              v-for="record in entity.inspectionRecords"
              :key="record.id"
              :title="formatDate(record.inspectedAt)"
              :label="record.summary || (record.result === 'PASS' ? '检查通过' : '存在问题')"
              is-link
              @click="showInspectionDetail(record)"
            >
              <template #value>
                <van-tag :type="record.result === 'PASS' ? 'success' : 'danger'" plain>
                  {{ record.result === 'PASS' ? '合格' : '不合格' }} {{ record.totalScore ? record.totalScore + '分' : '' }}
                </van-tag>
              </template>
            </van-cell>
          </van-cell-group>
        </div>

        <!-- 溯源二维码 -->
        <div v-if="entity.qrCodeRecord" style="margin-top:12px">
          <div class="section-title">溯源二维码</div>
          <van-cell-group inset>
            <van-cell title="QR编码" :value="entity.qrCodeRecord.code" />
            <van-cell title="扫码次数" :value="String(entity.qrCodeRecord.scanCount)" />
            <van-cell title="生成时间" :value="formatDate(entity.qrCodeRecord.createdAt)" />
          </van-cell-group>
        </div>
      </div>
      <van-loading v-else class="loading-center" size="24px" vertical>加载中...</van-loading>
    </van-pull-refresh>

    <!-- 检查详情弹窗 -->
    <van-popup v-model:show="detailPopup" position="bottom" round :style="{ maxHeight: '70%' }">
      <div v-if="detailRecord" class="detail-popup-content">
        <div class="detail-popup-title">检查详情</div>
        <van-cell-group inset>
          <van-cell title="检查日期" :value="formatDate(detailRecord.inspectedAt)" />
          <van-cell title="检查结果">
            <template #value><van-tag :type="detailRecord.result === 'PASS' ? 'success' : 'danger'">{{ detailRecord.result === 'PASS' ? '合格' : '不合格' }}</van-tag></template>
          </van-cell>
          <van-cell v-if="detailRecord.totalScore" title="总分" :value="String(detailRecord.totalScore)" />
          <van-cell v-if="detailRecord.issueCount" title="问题数" :value="String(detailRecord.issueCount)" />
          <van-cell title="检查员" :value="detailRecord.inspector?.realName || '-'" />
          <van-cell v-if="detailRecord.summary" title="摘要" :label="detailRecord.summary" />
        </van-cell-group>
        <van-button type="primary" block style="margin:16px" @click="detailPopup = false">关闭</van-button>
      </div>
    </van-popup>

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
import { useRouter, useRoute } from 'vue-router'
import { entitiesApi } from '@/api/index'
import { showToast, showImagePreview } from 'vant'

const router = useRouter()
const route = useRoute()
const entity = ref(null)
const refreshing = ref(false)
const activeTab = ref(0)
const detailPopup = ref(false)
const detailRecord = ref(null)

const loadData = async () => {
  try { entity.value = await entitiesApi.getPublic(route.params.id) }
  catch { showToast({ message: '加载失败' }) }
}
const onRefresh = async () => { await loadData(); refreshing.value = false }
onMounted(loadData)

const formatDate = (d) => d ? d.slice(0,10) : '-'
const getTypeLabel = (t) => ({ RESTAURANT:'餐饮服务', SUPERMARKET:'商超', CATERING:'集体供餐', FOOD_PRODUCTION:'食品生产', FOOD_SALES:'食品销售', CANTEEN:'单位食堂', OTHER:'其他' })[t] || t || '-'
const getRiskLabel = (r) => ({ A:'低风险', B:'中风险', C:'高风险' })[r] || r || '-'
const getRiskTagType = (r) => ({ A:'success', B:'warning', C:'danger' })[r] || 'default'
const getGuaranteeLabel = (g) => ({ A:'A级', B:'B级', C:'C级', D:'D级' })[g] || g || '-'
const getGuaranteeTagType = (g) => ({ A:'success', B:'primary', C:'warning', D:'danger' })[g] || 'default'
const getLicenseLabel = (l) => ({ BUSINESS_LICENSE:'营业执照', FOOD_LICENSE:'食品经营许可证', FOOD_PRODUCTION_LICENSE:'食品生产许可证', HEALTH_LICENSE:'卫生许可证' })[l] || l || '-'

const showInspectionDetail = (record) => { detailRecord.value = record; detailPopup.value = true }
const previewPhoto = (url) => { if (url) showImagePreview([url]) }
</script>

<style scoped>
.entity-detail-page { min-height:100vh; background:#f5f5f5; padding-bottom:60px }
.section-title { font-size:14px; font-weight:bold; color:#333; padding:12px 16px 4px }
.loading-center { display:flex; justify-content:center; padding-top:100px }
.photo-grid { display:flex; flex-wrap:wrap; gap:8px; padding:8px 16px }
.detail-popup-content { padding:16px 0 }
.detail-popup-title { font-size:16px; font-weight:bold; text-align:center; margin-bottom:12px }
</style>
