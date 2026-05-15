<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-chart-bar</v-icon>
      统计报表
      <v-spacer />
      <v-select v-model="reportType" :items="reportTypes" label="报表类型" density="compact" variant="outlined" hide-details class="me-2" style="max-width: 200px" />
      <v-btn color="primary" prepend-icon="mdi-export" @click="exportReport">导出报表</v-btn>
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <v-card variant="outlined">
            <v-card-title>检查统计</v-card-title>
            <v-card-text>
              <div class="text-h4 font-weight-bold">{{ stats.totalInspections }}</div>
              <div class="text-body-2">本月检查总数</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card variant="outlined">
            <v-card-title>投诉统计</v-card-title>
            <v-card-text>
              <div class="text-h4 font-weight-bold">{{ stats.totalComplaints }}</div>
              <div class="text-body-2">本月投诉总数</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-data-table :headers="headers" :items="items" :loading="loading" class="mt-4 elevation-0">
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { inspectionsApi, complaintsApi } from '../services/api'

const reportType = ref('monthly')
const loading = ref(false)
const items = ref<any[]>([])
const stats = ref({ totalInspections: 0, totalComplaints: 0 })
const reportTypes = ['日报', '周报', '月报', '年报']

const headers = [
  { title: '日期', key: 'date' },
  { title: '检查数量', key: 'inspections' },
  { title: '投诉数量', key: 'complaints' },
  { title: '整改完成', key: 'rectifications' },
]

const loadData = async () => {
  loading.value = true
  try {
    const [inspectionsRes, complaintsRes]: any[] = await Promise.all([
      inspectionsApi.list(),
      complaintsApi.list(),
    ])
    const ins = inspectionsRes.items || inspectionsRes || []
    const comp = complaintsRes.items || complaintsRes || []
    stats.value = {
      totalInspections: Array.isArray(ins) ? ins.length : (ins.total || 0),
      totalComplaints: Array.isArray(comp) ? comp.length : (comp.total || 0),
    }
    items.value = ins
  } catch (e) {
    console.error(e)
    alert('加载数据失败')
  }
  finally { loading.value = false }
}

const exportReport = () => { alert('报表导出 - 功能开发中') }

watch(reportType, loadData)
onMounted(loadData)
</script>