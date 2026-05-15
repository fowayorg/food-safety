<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">数据概览</h1>

    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card color="primary" variant="flat" class="text-white">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon size="48" class="me-4">mdi-store</v-icon>
              <div>
                <div class="text-h4 font-weight-bold">{{ stats.totalEntities }}</div>
                <div class="text-body-2">经营主体</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="info" variant="flat" class="text-white">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon size="48" class="me-4">mdi-clipboard-check</v-icon>
              <div>
                <div class="text-h4 font-weight-bold">{{ stats.totalInspections }}</div>
                <div class="text-body-2">检查记录</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="warning" variant="flat" class="text-white">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon size="48" class="me-4">mdi-alert-circle</v-icon>
              <div>
                <div class="text-h4 font-weight-bold">{{ stats.pendingComplaints }}</div>
                <div class="text-body-2">待处理投诉</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="error" variant="flat" class="text-white">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon size="48" class="me-4">mdi-assignment</v-icon>
              <div>
                <div class="text-h4 font-weight-bold">{{ stats.assignedTasks }}</div>
                <div class="text-body-2">待执行任务</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>检查结果分布</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="item in inspectionResults" :key="item.label">
                <template #prepend>
                  <v-avatar :color="item.color" size="32">
                    <span class="text-caption text-white">{{ item.count }}</span>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ item.label }}</v-list-item-title>
                <template #append>
                  <v-chip :color="item.color" size="small">{{ item.percent }}%</v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>风险等级分布</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="item in riskLevels" :key="item.label">
                <template #prepend>
                  <v-avatar :color="item.color" size="32">
                    <span class="text-caption text-white">{{ item.count }}</span>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ item.label }}</v-list-item-title>
                <template #append>
                  <v-chip :color="item.color" size="small">{{ item.percent }}%</v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>主体类型分布</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="item in entityTypes" :key="item.label">
                <template #prepend>
                  <v-avatar color="primary" size="32">
                    <span class="text-caption text-white">{{ item.count }}</span>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ item.label }}</v-list-item-title>
                <template #append>
                  <v-chip color="primary" size="small">{{ item.percent }}%</v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>投诉类别分布</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="item in complaintCategories" :key="item.label">
                <template #prepend>
                  <v-avatar color="warning" size="32">
                    <span class="text-caption text-white">{{ item.count }}</span>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ item.label }}</v-list-item-title>
                <template #append>
                  <v-chip color="warning" size="small">{{ item.percent }}%</v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { reportsApi } from '../services/api'

const stats = ref<any>({ totalEntities: 0, totalInspections: 0, pendingComplaints: 0, assignedTasks: 0 })
const inspectionByStatus = ref<any[]>([])
const riskDistribution = ref<any[]>([])
const entityTypeData = ref<any[]>([])
const complaintCategoryData = ref<any[]>([])

const resultLabelMap: Record<string, string> = { PASS: '合格', FAIL: '不合格' }
const resultColorMap: Record<string, string> = { PASS: 'success', FAIL: 'error' }

const riskLabelMap: Record<string, string> = {
  UNRATED: '未评级', LOW: '低风险', LOWER: '中低风险', MEDIUM: '中风险', HIGHER: '中高风险', HIGH: '高风险'
}
const riskColorMap: Record<string, string> = {
  UNRATED: 'grey', LOW: 'success', LOWER: 'light-blue', MEDIUM: 'warning', HIGHER: 'orange', HIGH: 'error'
}

const entityLabelMap: Record<string, string> = {
  RESTAURANT: '餐饮服务', SUPERMARKET: '商超', CATERING: '集体供餐', FOOD_PRODUCTION: '食品生产',
  FOOD_SALES: '食品销售', CANTEEN: '单位食堂', CONVENIENCE: '便利店', OTHER: '其他'
}

const complaintLabelMap: Record<string, string> = {
  FOOD_SAFETY: '食品安全', HYGIENE: '卫生问题', PRICE: '价格问题', SERVICE: '服务态度', LICENSE: '证照问题', OTHER: '其他'
}

const calcPercent = (items: any[]) => {
  const total = items.reduce((s, i) => s + i.count, 0)
  return items.map(i => ({ ...i, percent: total ? Math.round(i.count / total * 100) : 0 }))
}

const inspectionResults = computed(() =>
  calcPercent(inspectionByStatus.value.map(i => ({
    label: resultLabelMap[i.result] || i.result,
    count: i.count,
    color: resultColorMap[i.result] || 'grey',
  })))
)

const riskLevels = computed(() =>
  calcPercent(riskDistribution.value.map(i => ({
    label: riskLabelMap[i.riskLevel] || i.riskLevel,
    count: i.count,
    color: riskColorMap[i.riskLevel] || 'grey',
  })))
)

const entityTypes = computed(() =>
  calcPercent(entityTypeData.value.map(i => ({
    label: entityLabelMap[i.type] || i.type,
    count: i.count,
  })))
)

const complaintCategories = computed(() =>
  calcPercent(complaintCategoryData.value.map(i => ({
    label: complaintLabelMap[i.category] || i.category,
    count: i.count,
  })))
)

const loadData = async () => {
  try {
    const [dashRes, inspRes, entityRes, compRes]: any[] = await Promise.all([
      reportsApi.dashboard(),
      reportsApi.inspections(),
      reportsApi.entities(),
      reportsApi.complaints(),
    ])
    const dash = dashRes.data || dashRes
    stats.value = { totalEntities: dash.totalEntities || 0, totalInspections: dash.totalInspections || 0, pendingComplaints: dash.pendingComplaints || 0, assignedTasks: dash.assignedTasks || 0 }

    const insp = inspRes.data || inspRes
    inspectionByStatus.value = insp.byStatus || []

    const ent = entityRes.data || entityRes
    riskDistribution.value = ent.riskDistribution || []
    entityTypeData.value = ent.byType || []

    const comp = compRes.data || compRes
    complaintCategoryData.value = comp.byCategory || []
  } catch (e) {
    console.error('Dashboard data load failed', e)
  }
}

onMounted(loadData)
</script>
