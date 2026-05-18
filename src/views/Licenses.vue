<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-card-account-details</v-icon>
      许可备案管理
      <v-spacer />
      <v-select v-model="selectedEntityId" :items="entities" item-title="name" item-value="id" label="选择经营主体" density="compact" variant="outlined" hide-details style="max-width: 320px" class="me-2" />
      <v-btn color="success" prepend-icon="mdi-file-export" variant="outlined" class="me-2" @click="handleExport" :disabled="!selectedEntityId">导出Excel</v-btn>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()" :disabled="!selectedEntityId">新增许可</v-btn>
    </v-card-title>

    <v-data-table :headers="headers" :items="licenses" :loading="loading" class="elevation-0">
      <template #item.licenseType="{ item }">
        <v-chip size="small" :color="getTypeColor(item.licenseType)">{{ getTypeLabel(item.licenseType) }}</v-chip>
      </template>
      <template #item.validFrom="{ item }">
        {{ item.validFrom ? formatDate(item.validFrom) : '-' }}
      </template>
      <template #item.validTo="{ item }">
        <span :class="isExpiringSoon(item.validTo) ? 'text-warning font-weight-bold' : ''">
          {{ item.validTo ? formatDate(item.validTo) : '长期有效' }}
        </span>
        <v-icon v-if="isExpired(item.validTo)" color="error" size="small" class="ml-1">mdi-alert</v-icon>
      </template>
      <template #item.status="{ item }">
        <v-chip v-if="isExpired(item.validTo)" size="small" color="error">已过期</v-chip>
        <v-chip v-else-if="isExpiringSoon(item.validTo)" size="small" color="warning">即将到期</v-chip>
        <v-chip v-else size="small" color="success">有效</v-chip>
      </template>
      <template #item.actions="{ item }">
        <v-btn icon="mdi-pencil" variant="text" size="small" @click="openDialog(item)" />
        <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="handleDelete(item)" />
      </template>
    </v-data-table>

    <div v-if="!selectedEntityId" class="text-center text-grey pa-8">
      <v-icon size="64" color="grey-lighten-1">mdi-information-outline</v-icon>
      <div class="mt-2">请选择上方经营主体查看其许可证</div>
    </div>
  </v-card>

  <v-dialog v-model="dialog" max-width="600">
    <v-card>
      <v-card-title>{{ form.id ? '编辑许可' : '新增许可' }}</v-card-title>
      <v-card-subtitle v-if="selectedEntityName">{{ selectedEntityName }}</v-card-subtitle>
      <v-card-text>
        <v-form ref="formRef">
          <v-select v-model="form.licenseType" :items="licenseTypes" label="许可类型" variant="outlined" class="mb-2" />
          <v-chip size="small" :color="getTypeColor(form.licenseType)" class="ml-2">{{ licenseTypeLabelMap[form.licenseType] || form.licenseType }}</v-chip>
          <v-text-field v-model="form.licenseNo" label="许可证号" variant="outlined" class="mb-2" />
          <v-text-field v-model="form.identity" label="统一社会信用代码" variant="outlined" class="mb-2" />
          <v-text-field v-model="form.issuingAuthority" label="发证机关" variant="outlined" class="mb-2" />
          <v-textarea v-model="form.licenseContent" label="许可内容" variant="outlined" rows="2" class="mb-2" />
          <v-text-field v-model="form.validFrom" label="有效期起" type="date" variant="outlined" class="mb-2" />
          <v-text-field v-model="form.validTo" label="有效期止" type="date" variant="outlined" class="mb-2" />
          <v-text-field v-model="form.licensePhoto" label="许可证照片URL" variant="outlined" class="mb-2" />
          <v-text-field v-model="form.businessLicensePhoto" label="营业执照照片URL" variant="outlined" />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialog = false">取消</v-btn>
        <v-btn color="primary" @click="handleSave">保存</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { entitiesApi, exportsApi } from '../services/api'

const selectedEntityId = ref<number | null>(null)
const selectedEntityName = ref('')
const entities = ref<any[]>([])
const licenses = ref<any[]>([])
const loading = ref(false)
const dialog = ref(false)
const formRef = ref()

const form = ref<any>({
  id: null as string | null,
  licenseType: '',
  licenseNo: '',
  licenseContent: '',
  validFrom: '',
  validTo: '',
  licensePhoto: '',
  businessLicensePhoto: '',
})

const licenseTypes = [
  { title: '食品经营', value: 'FOOD_BUSINESS' },
  { title: '食品生产', value: 'FOOD_PRODUCTION' },
  { title: '食品流通', value: 'FOOD_CIRCULATION' },
  { title: '餐饮服务', value: 'CATERING' },
  { title: '小餐饮登记', value: 'RECORD' },
]
const licenseTypeLabelMap: Record<string, string> = {
  FOOD_BUSINESS: '食品经营', FOOD_PRODUCTION: '食品生产',
  FOOD_CIRCULATION: '食品流通', CATERING: '餐饮服务', RECORD: '小餐饮登记',
}

const headers = [
  { title: '许可类型', key: 'licenseType' },
  { title: '许可证号', key: 'licenseNo' },
  { title: '许可内容', key: 'licenseContent' },
  { title: '有效期起', key: 'validFrom' },
  { title: '有效期至', key: 'validTo' },
  { title: '状态', key: 'status' },
  { title: '操作', key: 'actions', sortable: false },
]

const getTypeColor = (type: string) => {
  const map: Record<string, string> = {
    FOOD_BUSINESS: 'blue', FOOD_PRODUCTION: 'green',
    FOOD_CIRCULATION: 'teal', CATERING: 'orange', RECORD: 'amber',
  }
  return map[type] || 'grey'
}
const getTypeLabel = (type: string) => licenseTypeLabelMap[type] || type

const formatDate = (d: string) => d ? d.slice(0, 10) : ''

const isExpired = (validTo: string) => validTo && new Date(validTo) < new Date()
const isExpiringSoon = (validTo: string) => {
  if (!validTo) return false
  const d = new Date(validTo)
  const now = new Date()
  const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diff > 0 && diff <= 30
}

// 加载经营主体列表
const loadEntities = async () => {
  try {
    const res: any = await entitiesApi.list({ pageSize: 500 })
    entities.value = res.items || res || []
  } catch (e) { console.error(e) }
}

// 加载选中主体的许可
const loadLicenses = async () => {
  if (!selectedEntityId.value) { licenses.value = []; return }
  loading.value = true
  try {
    const ent = entities.value.find(e => e.id === selectedEntityId.value)
    selectedEntityName.value = ent?.name || ''
    const res: any = await entitiesApi.getLicenses(selectedEntityId.value)
    licenses.value = Array.isArray(res) ? res : (res.items || [])
  } catch (e) {
    console.error(e)
    licenses.value = []
  } finally { loading.value = false }
}

watch(selectedEntityId, loadLicenses)

loadEntities()

const openDialog = (item?: any) => {
  if (item) {
    form.value = { ...item, validFrom: item.validFrom?.slice(0, 10), validTo: item.validTo?.slice(0, 10) }
  } else {
    form.value = { id: null, licenseType: 'FOOD_BUSINESS', licenseNo: '', licenseContent: '', validFrom: '', validTo: '', licensePhoto: '', businessLicensePhoto: '' }
  }
  dialog.value = true
}

const handleSave = async () => {
  if (!selectedEntityId.value) return
  try {
    const data = { ...form.value }
    delete data.id
    if (form.value.id) {
      await entitiesApi.updateLicense(selectedEntityId.value, form.value.id, data)
    } else {
      await entitiesApi.addLicense(selectedEntityId.value, data)
    }
    dialog.value = false
    loadLicenses()
  } catch (e: any) {
    alert(e?.response?.data?.message || e?.message || '保存失败')
  }
}

const handleDelete = async (item: any) => {
  if (!confirm(`确定删除许可证「${item.licenseType} - ${item.licenseNo}」吗？`)) return
  if (!confirm('此操作不可撤销，继续吗？')) return
  try {
    await entitiesApi.removeLicense(selectedEntityId.value!, item.id)
    loadLicenses()
  } catch (e: any) {
    alert(e?.response?.data?.message || e?.message || '删除失败')
  }
}

const handleExport = () => {
  exportsApi.download('licenses', { entityId: String(selectedEntityId.value) })
}
</script>
