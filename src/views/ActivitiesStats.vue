<template>
  <div class="stats-page">
    <v-container fluid class="pa-4">
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>活动统计概览</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6" md="3">
                  <v-statistic label="活动总数" :value="stats.total" color="primary" />
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-statistic label="进行中" :value="stats.active" color="success" />
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-statistic label="已结束" :value="stats.ended" color="grey" />
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-statistic label="参与人次" :value="stats.participants" color="warning" />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title>活动列表</v-card-title>
            <v-card-text>
              <v-data-table
                :headers="headers"
                :items="activities"
                :items-per-page="10"
                class="elevation-1"
              >
                <template #item.type="{ item }">
                  <v-chip :color="getTypeColor(item.type)" size="small">
                    {{ getTypeLabel(item.type) }}
                  </v-chip>
                </template>
                <template #item.status="{ item }">
                  <v-chip :color="getStatusColor(item.status)" size="small">
                    {{ getStatusLabel(item.status) }}
                  </v-chip>
                </template>
                <template #item.participantCount="{ item }">
                  {{ item._count?.participants || 0 }}
                </template>
                <template #item.actions="{ item }">
                  <v-btn size="small" color="primary" variant="text" @click="viewDetail(item)">
                    详情
                  </v-btn>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>按类型分布</v-card-title>
            <v-card-text>
              <div class="chart-container" style="height: 200px">
                <v-simple-table>
                  <thead>
                    <tr>
                      <th>类型</th>
                      <th>数量</th>
                      <th>占比</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="t in typeStats" :key="t.type">
                      <td>
                        <v-chip :color="getTypeColor(t.type)" size="small">
                          {{ getTypeLabel(t.type) }}
                        </v-chip>
                      </td>
                      <td>{{ t.count }}</td>
                      <td>{{ ((t.count / stats.total) * 100).toFixed(1) }}%</td>
                    </tr>
                  </tbody>
                </v-simple-table>
              </div>
            </v-card-text>
          </v-card>

          <v-card class="mt-4">
            <v-card-title>参与率趋势</v-card-title>
            <v-card-text>
              <div class="text-center text-body-2 text-grey">
                近7天活动参与趋势
              </div>
              <v-list density="compact">
                <v-list-item v-for="d in trendData" :key="d.date">
                  <v-list-item-title>{{ d.date }}</v-list-item-title>
                  <template #append>
                    <span class="text-primary font-weight-bold">{{ d.count }}人</span>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-dialog v-model="detailDialog" max-width="600">
        <v-card v-if="selectedActivity">
          <v-card-title>
            {{ selectedActivity.name }}
          </v-card-title>
          <v-card-text>
            <v-tabs v-model="detailTab" color="primary">
              <v-tab value="overview">概览</v-tab>
              <v-tab v-if="selectedActivity.type === 'VOTE'" value="votes">投票结果</v-tab>
              <v-tab v-if="selectedActivity.type === 'SUGGESTION'" value="suggestions">建议列表</v-tab>
            </v-tabs>

            <v-tabs-window v-model="detailTab">
              <v-tabs_window_value value="overview">
                <v-simple-table class="mt-2">
                  <tbody>
                    <tr><td>活动类型</td><td>{{ getTypeLabel(selectedActivity.type) }}</td></tr>
                    <tr><td>状态</td><td>{{ getStatusLabel(selectedActivity.status) }}</td></tr>
                    <tr><td>开始时间</td><td>{{ formatDate(selectedActivity.startDate) }}</td></tr>
                    <tr><td>结束时间</td><td>{{ formatDate(selectedActivity.endDate) }}</td></tr>
                    <tr><td>目标受众</td><td>{{ getAudienceLabel(selectedActivity.targetAudience) }}</td></tr>
                    <tr><td>参与人数</td><td>{{ selectedActivity._count?.participants || 0 }}</td></tr>
                  </tbody>
                </v-simple-table>
              </v-tabs_window_value>

              <v-tabs_window_value v-if="selectedActivity.type === 'VOTE'" value="votes">
                <div class="pa-4">
                  <v-list>
                    <v-list-item v-for="(opt, i) in voteOptions" :key="i">
                      <v-list-item-title>{{ opt }}</v-list-item-title>
                      <template #append>
                        <v-progress-circular
                          :model-value="getVotePercent(opt)"
                          color="primary"
                          size="24"
                        >
                          {{ getVoteCount(opt) }}
                        </v-progress-circular>
                      </template>
                    </v-list-item>
                  </v-list>
                </div>
              </v-tabs_window_value>

              <v-tabs_window_value v-if="selectedActivity.type === 'SUGGESTION'" value="suggestions">
                <v-list>
                  <v-list-item v-for="p in suggestions" :key="p.id">
                    <v-list-item-subtitle>{{ p.participantName }}</v-list-item-subtitle>
                    <v-list-item-title>{{ p.content }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-tabs_window_value>
            </v-tabs-window>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="detailDialog = false">关闭</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { activitiesApi } from '../services/api'

const loading = ref(false)
const activities = ref([])
const stats = ref({ total: 0, active: 0, ended: 0, participants: 0 })
const typeStats = ref([])
const trendData = ref([])
const detailDialog = ref(false)
const selectedActivity = ref(null)
const detailTab = ref('overview')
const voteOptions = ref([])
const voteResults = ref([])
const suggestions = ref([])

const headers = [
  { title: '活动名称', key: 'name' },
  { title: '类型', key: 'type' },
  { title: '状态', key: 'status' },
  { title: '参与人数', key: 'participantCount' },
  { title: '操作', key: 'actions', sortable: false },
]

onMounted(async () => {
  await loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await activitiesApi.list({ pageSize: 100 })
    activities.value = res.items || res.data || []
    
    stats.value = {
      total: activities.value.length,
      active: activities.value.filter(a => a.status === 'ACTIVE').length,
      ended: activities.value.filter(a => a.status === 'ENDED').length,
      participants: activities.value.reduce((sum, a) => sum + (a._count?.participants || 0), 0)
    }
    
    const typeCount = {}
    activities.value.forEach(a => {
      typeCount[a.type] = (typeCount[a.type] || 0) + 1
    })
    typeStats.value = Object.entries(typeCount).map(([type, count]) => ({ type, count }))
    
    // 生成趋势数据（模拟）
    const now = new Date()
    trendData.value = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now - i * 86400000)
      return {
        date: d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
        count: Math.floor(Math.random() * 20) + 5
      }
    }).reverse()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const viewDetail = async (item) => {
  selectedActivity.value = item
  detailDialog.value = true
  detailTab.value = 'overview'
  
  // 加载投票选项和结果
  if (item.type === 'VOTE' && item.config) {
    try {
      const cfg = typeof item.config === 'string' ? JSON.parse(item.config) : item.config
      voteOptions.value = cfg.options || []
      
      // 获取参与者统计
      const statsRes = await activitiesApi.stats(item.id)
      voteResults.value = statsRes.voteResults || []
    } catch {}
  }
  
  // 加载建议列表
  if (item.type === 'SUGGESTION') {
    try {
      const parts = await activitiesApi.participants(item.id)
      suggestions.value = parts || []
    } catch {}
  }
}

const getVoteCount = (opt) => voteResults.value.filter(r => r.content === opt).length
const getVotePercent = (opt) => {
  const total = voteResults.value.length
  if (!total) return 0
  return Math.round((getVoteCount(opt) / total) * 100)
}

const formatDate = (d) => d ? new Date(d).toLocaleString('zh-CN') : '-'
const getTypeLabel = (t) => ({ VOTE: '投票活动', SUGGESTION: '意见建议', PROMOTION: '促销活动', SURVEY: '问卷调查' }[t] || t)
const getTypeColor = (t) => ({ VOTE: 'blue', SUGGESTION: 'green', PROMOTION: 'orange', SURVEY: 'purple' }[t] || 'grey')
const getStatusLabel = (s) => ({ UPCOMING: '即将开始', PUBLISHED: '已发布', ACTIVE: '进行中', ENDED: '已结束', CANCELLED: '已取消' }[s] || s)
const getStatusColor = (s) => ({ UPCOMING: 'primary', PUBLISHED: 'primary', ACTIVE: 'success', ENDED: 'grey', CANCELLED: 'error' }[s] || 'grey')
const getAudienceLabel = (a) => ({ ALL: '全部', OPERATOR: '经营者', CONSUMER: '消费者' }[a] || a)
</script>

<style scoped>
.stats-page {
  background: #f5f5f5;
  min-height: calc(100vh - 48px);
}
</style>