<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-store</v-icon>
      经营主体管理
      <v-spacer />
      <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="搜索" density="compact" variant="outlined" hide-details class="me-2" style="max-width: 300px" />
      <v-btn v-if="selected.length" color="error" prepend-icon="mdi-delete-sweep" class="me-2" @click="handleBatchDelete">批量删除 ({{ selected.length }})</v-btn>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">新增主体</v-btn>
    </v-card-title>
    <v-data-table v-model="selected" :headers="headers" :items="entities" :loading="loading" :search="search" :return-object="true" show-select class="elevation-0">
      <template #item.status="{ item }">
        <v-chip :color="item.status === 'ACTIVE' ? 'success' : 'error'" size="small">{{ item.status === 'ACTIVE' ? '营业中' : '已停业' }}</v-chip>
      </template>
      <template #item.riskLevel="{ item }">
        <v-chip :color="getRiskColor(item.riskLevel)" size="small">{{ getRiskLabel(item.riskLevel) }}</v-chip>
      </template>
      <template #item.actions="{ item }">
        <v-btn icon="mdi-pencil" variant="text" size="small" @click="openDialog(item)" />
        <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="handleDelete(item)" />
        <v-btn icon="mdi-qrcode" variant="text" size="small" color="primary" @click="viewQRCode(item)" />
      </template>
    </v-data-table>
  </v-card>

  <v-dialog v-model="dialog" max-width="600">
    <v-card>
      <v-card-title>{{ form.id ? '编辑主体' : '新增主体' }}</v-card-title>
      <v-card-text>
        <v-form ref="formRef">
          <v-text-field v-model="form.name" label="主体名称" variant="outlined" class="mb-2" />
          <v-text-field v-model="form.licenseNo" label="许可证号" variant="outlined" class="mb-2" />
          <v-select v-model="form.type" :items="typeOptions" label="主体类型" variant="outlined" class="mb-2" />
          <v-text-field v-model="form.address" label="经营地址" variant="outlined" class="mb-2" />
          <v-select v-model="form.streetId" :items="streets" item-title="name" item-value="id" label="所属街道" variant="outlined" class="mb-2" />
          <v-select v-model="form.status" :items="statusOptions" label="经营状态" variant="outlined" />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialog = false">取消</v-btn>
        <v-btn color="primary" @click="handleSave">保存</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="qrDialog" max-width="400">
    <v-card>
      <v-card-title class="text-center">{{ qrEntityName }} - 二维码</v-card-title>
      <v-card-text class="text-center">
        <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" alt="QR Code" style="width:200px;height:200px;border:1px solid #ddd;" />
        <div v-else-if="qrLoading" class="text-grey my-4">生成中...</div>
        <div v-else class="text-error my-4">生成二维码失败</div>
        <div class="mt-3 text-caption text-grey">{{ qrCodeContent }}</div>
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn color="primary" variant="tonal" size="small" @click="downloadQR">下载</v-btn>
        <v-btn variant="text" @click="qrDialog = false">关闭</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { entitiesApi, streetsApi } from '../services/api'
import QRCode from 'qrcode'

const search = ref('')
const loading = ref(false)
const dialog = ref(false)
const entities = ref<any[]>([])
const streets = ref([])
const qrDialog = ref(false)
const qrEntityName = ref('')
const qrCodeDataUrl = ref('')
const qrCodeContent = ref('')
const qrLoading = ref(false)
const selected = ref<any[]>([])

const form = ref<any>({ id: null, name: '', licenseNo: '', type: 'RESTAURANT', address: '', streetId: null, status: 'ACTIVE', legalPerson: '', businessScope: '', guaranteeLevel: '', safetyDirector: '', safetyOfficer: '', guaranteeCadre: '', guaranteeCadreTitle: '' })
const statusOptions = [
  { title: '营业中', value: 'ACTIVE' },
  { title: '已停业', value: 'INACTIVE' },
]
const typeOptions = [
  { title: '餐饮服务', value: 'RESTAURANT' },
  { title: '单位食堂', value: 'CANTEEN' },
  { title: '小作坊', value: 'WORKSHOP' },
  { title: '超市', value: 'SUPERMARKET' },
  { title: '便利店', value: 'CONVENIENCE' },
  { title: '批发商', value: 'WHOLESALE' },
  { title: '其他', value: 'OTHER' },
]

const headers = [
  { title: '主体名称', key: 'name' },
  { title: '统一社会信用代码', key: 'creditCode' },
  { title: '许可证号', key: 'licenses.0.licenseNo' },
  { title: '经营地址', key: 'address' },
  { title: '所属街道', key: 'street.name' },
  { title: '风险等级', key: 'riskLevel' },
  { title: '状态', key: 'status' },
  { title: '操作', key: 'actions', sortable: false },
]

const getRiskColor = (level: string) => ({ UNRATED: 'grey', LOW: 'success', LOWER: 'teal', MEDIUM: 'warning', HIGHER: 'orange', HIGH: 'error' }[level] || 'grey')
const getRiskLabel = (level: string) => ({ UNRATED: '未评级', LOW: '低风险', LOWER: '较低风险', MEDIUM: '中风险', HIGHER: '较高风险', HIGH: '高风险' }[level] || '未知')

const loadData = async () => {
  loading.value = true
  try {
    const entitiesRes: any = await entitiesApi.list()
    const streetsRes: any = await streetsApi.list()
    entities.value = entitiesRes.items || entitiesRes || []
    streets.value = streetsRes.items || streetsRes || []
  } catch (e) { 
    console.error(e)
    alert('加载数据失败')
  }
  finally { loading.value = false }
}

const openDialog = (item?: any) => {
  form.value = item ? { ...item } : { id: null, name: '', licenseNo: '', type: 'RESTAURANT', address: '', streetId: null, status: 'ACTIVE', legalPerson: '', businessScope: '', guaranteeLevel: '', safetyDirector: '', safetyOfficer: '', guaranteeCadre: '', guaranteeCadreTitle: '' }
  dialog.value = true
}

const handleSave = async () => {
  try {
    // 转换字段名以匹配后端DTO
    const data = {
      name: form.value.name,
      creditCode: form.value.licenseNo || undefined,
      type: form.value.type || 'OTHER',
      legalPerson: form.value.legalPerson || undefined,
      address: form.value.address || undefined,
      streetId: form.value.streetId ? String(form.value.streetId) : undefined,
      businessScope: form.value.businessScope || undefined,
      guaranteeLevel: form.value.guaranteeLevel || undefined,
      safetyDirector: form.value.safetyDirector || undefined,
      safetyOfficer: form.value.safetyOfficer || undefined,
      guaranteeCadre: form.value.guaranteeCadre || undefined,
      guaranteeCadreTitle: form.value.guaranteeCadreTitle || undefined,
    }
    // 更新时保留id和status
    if (form.value.id) {
      await entitiesApi.update(form.value.id, { ...data, status: form.value.status })
    } else {
      await entitiesApi.create(data)
    }
    dialog.value = false
    loadData()
  } catch (e: any) { 
    alert(e?.response?.data?.message || e?.message || '保存失败') 
  }
}

const handleDelete = async (item: any) => {
  console.log('handleDelete开始, item:', item)
  if (!confirm(`确定删除 ${item.name} 吗？`)) return
  if (!confirm('确定要删除吗？此操作不可撤销')) return
  try {
    console.log('开始删除, id:', item.id)
    const result = await entitiesApi.delete(item.id)
    console.log('删除结果:', result)
    alert('删除成功')
    loadData()
  } catch (e: any) { 
    console.error('删除失败:', e)
    alert('删除失败: ' + (e?.response?.data?.message || e?.message || JSON.stringify(e)))
  }
}

const viewQRCode = async (item: any) => {
  qrEntityName.value = item.name
  qrCodeDataUrl.value = ''
  qrLoading.value = true
  qrDialog.value = true
  try {
    const code = item.qrCodeRecord?.code || `FOODSATETY-${item.id}`
    const content = `https://foodsatety.example.com/scan/${code}`
    qrCodeContent.value = code
    qrCodeDataUrl.value = await QRCode.toDataURL(content, { width: 200, margin: 2 })
  } catch (e) {
    console.error('QR生成失败', e)
  } finally {
    qrLoading.value = false
  }
}

const downloadQR = () => {
  if (!qrCodeDataUrl.value) return
  const link = document.createElement('a')
  link.download = `${qrEntityName.value}-二维码.png`
  link.href = qrCodeDataUrl.value
  link.click()
}

const handleBatchDelete = async () => {
  if (!selected.value.length) return
  if (!confirm(`确定删除 ${selected.value.length} 个主体？此操作不可撤销`)) return
  try {
    await entitiesApi.batchDelete(selected.value.map((i: any) => i.id))
    alert(`成功删除 ${selected.value.length} 个主体`)
    selected.value = []
    loadData()
  } catch (e: any) { alert('批量删除失败: ' + (e?.response?.data?.message || e?.message)) }
}

onMounted(loadData)
</script>
