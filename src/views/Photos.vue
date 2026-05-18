<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-image-multiple</v-icon>
      照片管理
      <v-spacer />
      <v-select v-model="selectedEntityId" :items="entities" item-title="name" item-value="id"
        label="选择经营主体" density="compact" variant="outlined" hide-details
        style="max-width: 320px" class="me-2" />
    </v-card-title>

    <!-- 操作栏 -->
    <div class="px-4 pb-2" v-if="selectedEntityId">
      <v-btn color="primary" prepend-icon="mdi-plus" size="small" @click="openDialog()">
        上传照片
      </v-btn>
      <v-btn color="success" prepend-icon="mdi-file-export" variant="outlined" size="small" class="ml-2"
        @click="handleBatchAdd">
        批量添加
      </v-btn>
    </div>

    <!-- 照片列表（按分类分组展示） -->
    <div v-if="selectedEntityId" class="px-4 pb-4">
      <div v-for="(group, category) in groupedPhotos" :key="category" class="mb-4">
        <div class="text-subtitle-2 text-primary mb-2 d-flex align-center">
          <v-icon size="18" class="me-1">{{ getCategoryIcon(group[0]?.category) }}</v-icon>
          {{ getCategoryLabel(group[0]?.category) }}
          <v-chip size="x-small" class="ml-2">{{ group.length }} 张</v-chip>
        </div>
        <v-row dense>
          <v-col v-for="photo in group" :key="photo.id" cols="auto">
            <v-card width="160" class="photo-card" @click="openPreview(photo)">
              <v-img :src="photo.url" height="120" cover class="bg-grey-lighten-2">
                <template #error>
                  <div class="d-flex align-center justify-center fill-height text-grey">
                    <v-icon size="40">mdi-image-broken</v-icon>
                  </div>
                </template>
              </v-img>
              <div class="photo-info">
                <div class="text-caption text-truncate">{{ photo.description || '无描述' }}</div>
                <div class="d-flex justify-end">
                  <v-btn icon="mdi-delete" variant="text" size="x-small" color="error"
                    @click.stop="handleDelete(photo)" />
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="auto" v-if="group.length === 0">
            <div class="text-grey text-caption pa-4">该分类暂无照片</div>
          </v-col>
        </v-row>
      </div>
      <div v-if="photos.length === 0 && !loading" class="text-center text-grey pa-8">
        <v-icon size="48" color="grey-lighten-1">mdi-image-off</v-icon>
        <div class="mt-2 text-caption">暂无照片，点击上方按钮上传</div>
      </div>
    </div>

    <!-- 未选主体提示 -->
    <div v-if="!selectedEntityId" class="text-center text-grey pa-8">
      <v-icon size="64" color="grey-lighten-1">mdi-image-multiple</v-icon>
      <div class="mt-2">请选择上方经营主体查看其照片</div>
    </div>

    <v-progress-linear v-if="loading" indeterminate color="primary" />
  </v-card>

  <!-- 上传对话框 -->
  <v-dialog v-model="dialog" max-width="520">
    <v-card>
      <v-card-title>{{ batchMode ? '批量添加照片' : '上传照片' }}</v-card-title>
      <v-card-text>
        <v-select v-model="form.category" :items="categoryItems" label="照片分类" variant="outlined"
          class="mb-2" />
        <v-text-field v-model="form.url" label="图片URL" variant="outlined" class="mb-2"
          placeholder="https://example.com/photo.jpg" />
        <div v-if="form.url" class="mb-2">
          <v-img :src="form.url" max-height="160" cover class="rounded bg-grey-lighten-2">
            <template #error>
              <div class="d-flex align-center justify-center fill-height text-grey">
                <v-icon>mdi-image-broken</v-icon>
              </div>
            </template>
          </v-img>
        </div>
        <v-textarea v-model="form.description" label="照片描述（选填）" variant="outlined" rows="2"
          class="mb-2" />
        <v-text-field v-if="batchMode" v-model="urlsText" label="多张URL（每行一张）" variant="outlined"
          rows="4" placeholder="https://...&#10;https://...&#10;https://..." />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialog = false">取消</v-btn>
        <v-btn color="primary" :loading="saving" @click="handleSave">保存</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 图片预览 -->
  <v-dialog v-model="previewDialog" max-width="800">
    <v-card v-if="previewPhoto">
      <v-img :src="previewPhoto.url" max-height="600" contain class="bg-grey-darken-4" />
      <v-card-text>
        <div class="d-flex align-center mb-2">
          <v-chip size="small">{{ getCategoryLabel(previewPhoto.category) }}</v-chip>
          <span class="ml-2 text-caption text-grey">
            {{ formatDate(previewPhoto.createdAt) }}
          </span>
        </div>
        <div>{{ previewPhoto.description || '无描述' }}</div>
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text" @click="previewDialog = false">关闭</v-btn>
        <v-spacer />
        <v-btn color="error" variant="text" @click="handleDelete(previewPhoto); previewDialog = false">
          删除
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { entitiesApi } from '../services/api'

const selectedEntityId = ref<number | null>(null)
const entities = ref<any[]>([])
const photos = ref<any[]>([])
const loading = ref(false)
const dialog = ref(false)
const batchMode = ref(false)
const saving = ref(false)
const previewDialog = ref(false)
const previewPhoto = ref<any>(null)
const urlsText = ref('')

const form = ref({ category: 'STORE_SCENE', url: '', description: '' })

const categoryItems = [
  { title: '门店场景', value: 'STORE_SCENE' },
  { title: '经营规范', value: 'BUSINESS_NORM' },
  { title: '检查现场', value: 'INSPECTION_SCENE' },
  { title: '活动现场', value: 'ACTIVITY' },
]

const categoryLabelMap: Record<string, string> = {
  STORE_SCENE: '门店场景', BUSINESS_NORM: '经营规范',
  INSPECTION_SCENE: '检查现场', ACTIVITY: '活动现场',
}

const categoryIconMap: Record<string, string> = {
  STORE_SCENE: 'mdi-store', BUSINESS_NORM: 'mdi-clipboard-check',
  INSPECTION_SCENE: 'mdi-camera', ACTIVITY: 'mdi-party-popper',
}

const groupedPhotos = computed(() => {
  const groups: Record<string, any[]> = {}
  for (const photo of photos.value) {
    const cat = photo.category || 'OTHER'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(photo)
  }
  return groups
})

const loadEntities = async () => {
  try {
    const res: any = await entitiesApi.list({ pageSize: 500 })
    entities.value = res.items || res || []
  } catch (e) { console.error(e) }
}

const loadPhotos = async () => {
  if (!selectedEntityId.value) { photos.value = []; return }
  loading.value = true
  try {
    const res: any = await entitiesApi.getPhotos(selectedEntityId.value)
    photos.value = Array.isArray(res) ? res : (res.items || [])
  } catch (e) {
    console.error(e); photos.value = []
  } finally { loading.value = false }
}

watch(selectedEntityId, () => { if (selectedEntityId.value) loadPhotos() })

loadEntities()

const getCategoryLabel = (cat: string) => categoryLabelMap[cat] || cat || '其他'
const getCategoryIcon = (cat: string) => categoryIconMap[cat] || 'mdi-image'

const formatDate = (d: string) => d ? d.slice(0, 16).replace('T', ' ') : ''

const openDialog = () => {
  batchMode.value = false
  form.value = { category: 'STORE_SCENE', url: '', description: '' }
  urlsText.value = ''
  dialog.value = true
}

const openPreview = (photo: any) => {
  previewPhoto.value = photo
  previewDialog.value = true
}

const handleBatchAdd = () => {
  batchMode.value = true
  form.value = { category: 'STORE_SCENE', url: '', description: '' }
  urlsText.value = ''
  dialog.value = true
}

const handleSave = async () => {
  if (!selectedEntityId.value) return
  saving.value = true
  try {
    if (batchMode.value) {
      const urls = urlsText.value.split('\n').map(u => u.trim()).filter(Boolean)
      const photos = urls.map(url => ({ category: form.value.category, url, description: form.value.description }))
      await entitiesApi.addPhotos(selectedEntityId.value, photos)
    } else {
      if (!form.value.url) { alert('请填写图片URL'); saving.value = false; return }
      await entitiesApi.addPhoto(selectedEntityId.value, form.value)
    }
    dialog.value = false
    loadPhotos()
  } catch (e: any) {
    alert(e?.response?.data?.message || e?.message || '保存失败')
  } finally { saving.value = false }
}

const handleDelete = async (photo: any) => {
  if (!confirm('确定删除该照片吗？')) return
  try {
    await entitiesApi.removePhoto(selectedEntityId.value!, photo.id)
    loadPhotos()
  } catch (e: any) {
    alert(e?.response?.data?.message || e?.message || '删除失败')
  }
}
</script>

<style scoped>
.photo-card { cursor: pointer; border-radius: 8px; overflow: hidden; }
.photo-info { padding: 6px 8px 4px; }
.v-img { border-radius: 4px; }
</style>
