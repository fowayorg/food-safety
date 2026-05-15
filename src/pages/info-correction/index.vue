<template>
  <div class="info-correction-list-page">
    <van-nav-bar title="更正申请记录" left-arrow @click-left="router.back()" fixed />

    <van-tabs v-model:active="activeStatus" sticky offset-top="46px" @change="onTabChange">
      <van-tab title="全部" name="ALL" />
      <van-tab title="待审核" name="PENDING" />
      <van-tab title="已通过" name="APPROVED" />
      <van-tab title="已驳回" name="REJECTED" />
    </van-tabs>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loadingMore" :finished="finished" finished-text="没有更多了" @load="onLoadMore">
        <div v-for="item in list" :key="item.id" class="correction-card" @click="viewDetail(item)">
          <div class="card-header">
            <div class="entity-name">{{ item.entity?.name || '未知主体' }}</div>
            <van-tag :type="statusTagMap[item.status]">{{ statusLabelMap[item.status] }}</van-tag>
          </div>
          <div class="card-content">
            <div class="field-row">
              <span class="label">更正字段：</span>
              <span>{{ fieldLabelMap[item.fieldName] || item.fieldName }}</span>
            </div>
            <div class="value-row">
              <span class="label">原值：</span>
              <span class="old-value">{{ item.oldValue || '-' }}</span>
            </div>
            <div class="value-row">
              <span class="label">新值：</span>
              <span class="new-value">{{ item.newValue }}</span>
            </div>
          </div>
          <div class="card-footer">
            <span>{{ formatTime(item.createdAt) }}</span>
          </div>
        </div>
        <van-empty v-if="!loadingMore && list.length === 0" description="暂无申请记录" />
      </van-list>
    </van-pull-refresh>

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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { infoCorrectionsApi } from '@/api/index'

const router = useRouter()

const refreshing = ref(false)
const loadingMore = ref(false)
const finished = ref(false)
const list = ref([])
const activeStatus = ref('ALL')
const activeTab = ref(0)
const page = ref(1)

const statusLabelMap = {
  PENDING: '待审核',
  APPROVED: '已通过',
  REJECTED: '已驳回',
}

const statusTagMap = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
}

const fieldLabelMap = {
  name: '主体名称',
  address: '地址',
  legalPerson: '法定代表人',
  phone: '联系电话',
  businessScope: '经营范围',
}

function formatTime(time) {
  if (!time) return ''
  const d = new Date(time)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

async function loadData(reset = false) {
  if (reset) {
    page.value = 1
    list.value = []
    finished.value = false
  }

  try {
    const params = {
      page: page.value,
      pageSize: 10,
    }
    if (activeStatus.value !== 'ALL') {
      params.status = activeStatus.value
    }

    const res = await infoCorrectionsApi.list(params)
    const items = res.data?.items || []

    if (reset) {
      list.value = items
    } else {
      list.value.push(...items)
    }

    if (items.length < 10) {
      finished.value = true
    }
  } catch (e) {
    console.error('加载失败', e)
    finished.value = true
  }
}

async function onRefresh() {
  await loadData(true)
  refreshing.value = false
}

async function onLoadMore() {
  page.value++
  await loadData()
  loadingMore.value = false
}

function onTabChange() {
  loadData(true)
}

function viewDetail(item) {
  router.push({ name: 'InfoCorrectionDetail', params: { id: item.id } })
}

onMounted(() => {
  loadData(true)
})
</script>

<style scoped>
.info-correction-list-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.correction-card {
  background: #fff;
  margin: 12px 16px;
  border-radius: 8px;
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.entity-name {
  font-size: 16px;
  font-weight: bold;
}

.card-content {
  font-size: 14px;
  color: #333;
}

.field-row,
.value-row {
  margin-bottom: 6px;
}

.label {
  color: #999;
}

.old-value {
  text-decoration: line-through;
  color: #999;
}

.new-value {
  color: #1976d2;
}

.card-footer {
  margin-top: 12px;
  font-size: 12px;
  color: #999;
}
</style>
