<template>
  <div class="submit-page">
    <van-nav-bar title="投诉举报" left-arrow @click-left="router.back()" fixed />

    <van-form @submit="handleSubmit">
      <van-cell-group inset title="投诉信息">
        <van-field
          v-model="form.category"
          is-link
          readonly
          name="category"
          label="投诉类别"
          placeholder="请选择"
          @click="showCategoryPicker = true"
          :rules="[{ required: true, message: '请选择投诉类别' }]"
        />
        <van-field
          v-model="form.content"
          type="textarea"
          name="content"
          label="投诉内容"
          placeholder="请详细描述投诉问题..."
          rows="4"
          show-word-limit
          maxlength="500"
          :rules="[{ required: true, message: '请输入投诉内容' }]"
        />
        <van-field
          v-model="form.contact"
          name="contact"
          label="联系方式"
          placeholder="手机号或邮箱（选填）"
        />
      </van-cell-group>

      <!-- 图片上传 -->
      <van-cell-group inset title="上传证据（选填）">
        <div class="upload-wrap">
          <van-uploader
            v-model="form.images"
            :max-count="4"
            :after-read="onAfterRead"
            accept="image/*"
          />
        </div>
      </van-cell-group>

      <div class="submit-btn">
        <van-button type="primary" native-type="submit" block round :loading="submitting">
          提交投诉
        </van-button>
      </div>
    </van-form>

    <!-- 类别选择 -->
    <van-popup v-model:show="showCategoryPicker" position="bottom">
      <van-picker
        :columns="categoryColumns"
        @confirm="onCategoryConfirm"
        @cancel="showCategoryPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { complaintsApi } from '@/api/index'
import { showToast, showSuccessToast } from 'vant'

const router = useRouter()
const route = useRoute()
const showCategoryPicker = ref(false)
const submitting = ref(false)
const categoryColumns = [
  { text: '食品安全问题', value: 'FOOD_SAFETY' },
  { text: '卫生环境问题', value: 'SANITATION' },
  { text: '证照过期问题', value: 'LICENSE' },
  { text: '虚假宣传', value: 'FRAUD' },
  { text: '价格欺诈', value: 'PRICE' },
  { text: '其他问题', value: 'OTHER' },
]

const form = ref({
  category: '',
  categoryCode: '',
  content: '',
  contact: '',
  images: [],
  entityId: null,
})

onMounted(() => {
  // 支持从 URL 参数传入 entityId
  if (route.query.entityId) {
    form.value.entityId = Number(route.query.entityId)
  }
})

const onCategoryConfirm = ({ selectedOptions }) => {
  form.value.category = selectedOptions[0].text
  form.value.categoryCode = selectedOptions[0].value
  showCategoryPicker.value = false
}

const onAfterRead = (file) => {
  file.status = 'uploading'
  file.message = '上传中...'
  // 模拟上传
  setTimeout(() => {
    file.status = 'done'
    file.message = ''
  }, 1000)
}

const handleSubmit = async () => {
  if (!form.value.categoryCode) {
    showToast({ message: '请选择投诉类别' })
    return
  }
  if (!form.value.content.trim()) {
    showToast({ message: '请输入投诉内容' })
    return
  }

  submitting.value = true
  try {
    const payload = {
      category: form.value.categoryCode,
      description: form.value.content,
      contact: form.value.contact,
    }
    if (form.value.entityId) {
      payload.entityId = form.value.entityId
    }

    await complaintsApi.create(payload)
    showSuccessToast({
      message: '提交成功',
      onClose: () => router.replace('/complaint'),
    })
  } catch (e) {
    showToast({ message: '提交失败，请重试' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.submit-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 46px;
}

.upload-wrap {
  padding: 12px 16px;
}

.submit-btn {
  margin: 24px 16px;
}
</style>
