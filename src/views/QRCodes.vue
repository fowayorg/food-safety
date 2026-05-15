<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-qrcode</v-icon>
      二维码管理
      <v-spacer />
      <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="搜索" density="compact" variant="outlined" hide-details class="me-2" style="max-width: 300px" />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openBatchGenerateDialog()">批量生成</v-btn>
    </v-card-title>
    <v-data-table :headers="headers" :items="items" :loading="loading" :search="search" class="elevation-0">
      <template #item.entity="{ item }">
        <span>{{ item.entity?.name || '未知' }}</span>
      </template>
      <template #item.isActive="{ item }">
        <v-chip :color="item.isActive ? 'success' : 'error'" size="small">{{ item.isActive ? '有效' : '已失效' }}</v-chip>
      </template>
      <template #item.actions="{ item }">
        <v-btn icon="mdi-eye" variant="text" size="small" @click="openViewDialog(item)" />
        <v-btn icon="mdi-printer" variant="text" size="small" @click="openPrintDialog(item)" />
        <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="handleDelete(item)" />
      </template>
    </v-data-table>

    <v-dialog v-model="batchDialog" max-width="500">
      <v-card>
        <v-card-title>批量生成二维码</v-card-title>
        <v-card-text>
          <v-select v-model="batchType" :items="typeOptions" item-title="title" item-value="value" label="选择主体类型" variant="outlined" class="mb-3" />
          <v-btn color="primary" block @click="generateBatch">生成</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="viewDialog" max-width="400">
      <v-card>
        <v-card-title class="text-center">{{ viewItem?.entity?.name || '' }} - 二维码</v-card-title>
        <v-card-text class="text-center">
          <img v-if="viewQrDataUrl" :src="viewQrDataUrl" alt="QR" style="width:200px;height:200px;border:1px solid #ddd;" />
          <div v-else class="text-grey py-8">加载中...</div>
          <div class="mt-2 text-caption text-grey">{{ viewItem?.code }}</div>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn variant="text" @click="viewDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="printDialog" max-width="400">
      <v-card>
        <v-card-title class="text-center">打印二维码</v-card-title>
        <v-card-text class="text-center">
          <img v-if="printQrDataUrl" :src="printQrDataUrl" alt="QR" style="width:200px;height:200px;border:1px solid #ddd;" class="mb-2" />
          <div v-else class="text-grey py-8">加载中...</div>
          <div class="mb-2 text-caption">{{ printItem?.code }}</div>
          <div class="text-caption text-grey">{{ printItem?.entity?.name }}</div>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn color="primary" variant="tonal" size="small" @click="doPrint">打印</v-btn>
          <v-btn variant="text" @click="printDialog = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { qrcodesApi } from '../services/api'
import QRCode from 'qrcode'

const search = ref('')
const loading = ref(false)
const items = ref<any[]>([])
const batchDialog = ref(false)
const batchType = ref('')
const viewDialog = ref(false)
const viewItem = ref<any>(null)
const viewQrDataUrl = ref('')
const printDialog = ref(false)
const printItem = ref<any>(null)
const printQrDataUrl = ref('')

const headers = [
  { title: '二维码编号', key: 'code' },
  { title: '经营主体', key: 'entity.name' },
  { title: '街道', key: 'street.name' },
  { title: '状态', key: 'isActive' },
  { title: '生成时间', key: 'createdAt' },
  { title: '操作', key: 'actions', sortable: false },
]

const S1 = '请选择主体类型'
const S2 = '该类型暂无主体'
const S3 = '批量生成完成'
const S4 = '弹出窗口被拦截，请允许弹窗'
const S5 = '二维码打印'


const loadData = async () => {
  loading.value = true
  try {
    const res: any = await qrcodesApi.list()
    items.value = res.items || res || []
  } catch (e) {
    console.error(e)
    alert('加载数据失败')
  }
  finally { loading.value = false }
}

const typeOptions = [
  { title: '餐饮服务', value: 'RESTAURANT' },
  { title: '单位食堂', value: 'CANTEEN' },
  { title: '小作坊', value: 'WORKSHOP' },
  { title: '超市', value: 'SUPERMARKET' },
  { title: '便利店', value: 'CONVENIENCE' },
  { title: '批发商', value: 'WHOLESALE' },
  { title: '其他', value: 'OTHER' },
]

const openBatchGenerateDialog = () => { batchDialog.value = true }

const generateBatch = async () => {
  if (!batchType.value) { alert(S1); return }
  try {
    const res = await fetch('http://localhost:5100/api/v1/entities?type=' + batchType.value + '&limit=100', {
      headers: { Authorization: 'Bearer ' + (localStorage.getItem('token') || '') }
    })
    const data = await res.json()
    const entities = data.items || data || []
    if (!entities.length) { alert(S2); return }
    let created = 0
    for (const ent of entities) {
      try { await qrcodesApi.create({ entityId: ent.id }); created++ } catch {}
    }
    alert(S3 + ': ' + created)
    batchDialog.value = false
    loadData()
  } catch (e: any) { alert(e?.message || '生成失败') }
}

const makeDataUrl = async (code: string) => {
  try { return await QRCode.toDataURL('https://foodsatety.example.com/scan/' + code, { width: 200, margin: 2 }) }
  catch { return '' }
}

const openViewDialog = async (item: any) => {
  viewItem.value = item
  viewQrDataUrl.value = ''
  viewDialog.value = true
  viewQrDataUrl.value = await makeDataUrl(item.code)
}

const openPrintDialog = async (item: any) => {
  printItem.value = item
  printQrDataUrl.value = ''
  printDialog.value = true
  printQrDataUrl.value = await makeDataUrl(item.code)
}

const doPrint = () => {
  if (!printQrDataUrl.value) return
  const win = window.open('', 'PRINT', 'height=400,width=300')
  if (!win) { alert(S4); return }
  const entityName = printItem.value?.entity?.name || ''
  const printCode = printItem.value?.code || ''
  win.document.write('<html><head><title>' + S5 + '</title><style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif}img{width:180px;height:180px}div{margin-top:8px;font-size:14px;color:#666}</style></head><body><img src="' + printQrDataUrl.value + '"/><div>' + printCode + '</div><div>' + entityName + '</div></body></html>')
  win.document.close()
  win.focus()
  win.print()
  win.close()
}

const handleDelete = async (item: any) => {
  if (!confirm('确定删除此二维码？')) return
  try {
    await qrcodesApi.delete(item.id)
    loadData()
  } catch (e: any) { alert(e?.message || '删除失败') }
}

onMounted(() => { loadData() })
</script>