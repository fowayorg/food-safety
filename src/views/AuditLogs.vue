<template>
  <v-container fluid>
    <!-- 统计卡片 -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-overline mb-1">总操作数</div>
            <div class="text-h4">{{ stats.total || 0 }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-overline mb-1">今日操作</div>
            <div class="text-h4">{{ stats.todayCount || 0 }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-overline mb-1">操作类型</div>
            <div class="text-body-1">
              <span v-for="a in stats.actionBreakdown" :key="a.action" class="mr-2">
                {{ a.action }}: {{ a.count }}
              </span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-overline mb-1">模块分布</div>
            <div class="text-body-1">
              <span v-for="m in stats.moduleBreakdown" :key="m.module" class="mr-2">
                {{ m.module }}: {{ m.count }}
              </span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 筛选栏 -->
    <v-card class="mb-4">
      <v-card-title>筛选条件</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="filter.action"
              :items="actionOptions"
              label="操作类型"
              clearable
              density="compact"
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="filter.module"
              label="模块"
              clearable
              density="compact"
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="filter.startDate"
              label="开始日期"
              type="date"
              density="compact"
            />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="filter.endDate"
              label="结束日期"
              type="date"
              density="compact"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-btn color="primary" @click="loadData" :loading="loading">查询</v-btn>
            <v-btn class="ml-2" @click="resetFilter">重置</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 数据表格 -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="logs"
        :loading="loading"
        :server-items-length="total"
        :items-per-page="pageSize"
        @update:items-per-page="pageSize = $event; loadData()"
        @update:page="page = $event; loadData()"
      >
        <template v-slot:item.user="{ item }">
          {{ item.user?.realName || item.user?.username || '-' }}
        </template>
        <template v-slot:item.action="{ item }">
          <v-chip :color="getActionColor(item.action)" size="small">
            {{ item.action }}
          </v-chip>
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip :color="item.status === 'SUCCESS' ? 'success' : 'error'" size="small">
            {{ item.status }}
          </v-chip>
        </template>
        <template v-slot:item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>
        <template v-slot:item.detail="{ item }">
          <v-btn size="small" variant="text" @click="showDetail(item)">
            查看
          </v-btn>
        </template>
        <template v-slot:no-data>
          <v-empty-state title="无审计日志数据" />
        </template>
      </v-data-table>
    </v-card>

    <!-- 详情弹窗 -->
    <v-dialog v-model="detailDialog" max-width="600">
      <v-card>
        <v-card-title>操作详情</v-card-title>
        <v-card-text>
          <v-list dense>
            <v-list-item>
              <v-list-item-title>操作人</v-list-item-title>
              <v-list-item-subtitle>
                {{ selectedItem?.user?.realName || selectedItem?.user?.username || '-' }}
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>操作类型</v-list-item-title>
              <v-list-item-subtitle>{{ selectedItem?.action }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>模块</v-list-item-title>
              <v-list-item-subtitle>{{ selectedItem?.module }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>目标ID</v-list-item-title>
              <v-list-item-subtitle>{{ selectedItem?.targetId || '-' }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>IP地址</v-list-item-title>
              <v-list-item-subtitle>{{ selectedItem?.ip || '-' }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>状态</v-list-item-title>
              <v-list-item-subtitle>{{ selectedItem?.status }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="selectedItem?.errorMsg">
              <v-list-item-title>错误信息</v-list-item-title>
              <v-list-item-subtitle class="text-error">
                {{ selectedItem?.errorMsg }}
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>时间</v-list-item-title>
              <v-list-item-subtitle>{{ formatDate(selectedItem?.createdAt) }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-divider class="my-2" />
          <div class="text-subtitle-2 mb-2">详细信息</div>
          <pre class="text-body-2 bg-grey-lighten-3 pa-2 rounded" style="max-height: 200px; overflow: auto;">
            {{ formatDetail(selectedItem?.detail) }}
          </pre>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="detailDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { auditLogsApi } from '../services/api';

const loading = ref(false);
const logs = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const stats = ref<any>({
  total: 0,
  todayCount: 0,
  actionBreakdown: [],
  moduleBreakdown: [],
});

const filter = ref({
  action: null,
  module: null,
  startDate: null,
  endDate: null,
});

const detailDialog = ref(false);
const selectedItem = ref<any>(null);

const headers = [
  { title: '时间', key: 'createdAt', sortable: false },
  { title: '操作人', key: 'user', sortable: false },
  { title: '操作类型', key: 'action', sortable: false },
  { title: '模块', key: 'module', sortable: false },
  { title: '目标ID', key: 'targetId', sortable: false },
  { title: '状态', key: 'status', sortable: false },
  { title: '详情', key: 'detail', sortable: false },
];

const actionOptions = [
  { title: '创建', value: 'CREATE' },
  { title: '更新', value: 'UPDATE' },
  { title: '删除', value: 'DELETE' },
  { title: '登录', value: 'LOGIN' },
  { title: '导出', value: 'EXPORT' },
];

const getActionColor = (action: string) => {
  switch (action) {
    case 'CREATE': return 'success';
    case 'UPDATE': return 'warning';
    case 'DELETE': return 'error';
    case 'LOGIN': return 'info';
    default: return 'default';
  }
};

const formatDate = (date: string) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
};

const formatDetail = (detail: string) => {
  if (!detail) return '-';
  try {
    return JSON.stringify(JSON.parse(detail), null, 2);
  } catch {
    return detail;
  }
};

const showDetail = (item: any) => {
  selectedItem.value = item;
  detailDialog.value = true;
};

const resetFilter = () => {
  filter.value = {
    action: null,
    module: null,
    startDate: null,
    endDate: null,
  };
  page.value = 1;
  loadData();
};

const loadData = async () => {
  loading.value = true;
  try {
    const params: any = { page: page.value, pageSize: pageSize.value };
    if (filter.value.action) params.action = filter.value.action;
    if (filter.value.module) params.module = filter.value.module;
    if (filter.value.startDate) params.startDate = filter.value.startDate;
    if (filter.value.endDate) params.endDate = filter.value.endDate;

    const res: any = await auditLogsApi.list(params);
    logs.value = res.items || [];
    total.value = res.total || 0;
  } catch (e) {
    console.error('加载审计日志失败', e);
  } finally {
    loading.value = false;
  }
};

const loadStats = async () => {
  try {
    stats.value = await auditLogsApi.stats() as any;
  } catch (e) {
    console.error('加载统计信息失败', e);
  }
};

onMounted(() => {
  loadData();
  loadStats();
});
</script>