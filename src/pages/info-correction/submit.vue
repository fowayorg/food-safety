<template>
  <div class="info-correction-page">
    <van-nav-bar title="信息更正申请" left-arrow @click-left="router.back()" fixed />

    <van-form @submit="handleSubmit">
      <van-cell-group inset title="主体信息">
        <van-field
          v-model="form.entityName"
          is-link
          readonly
          name="entity"
          label="经营主体"
          placeholder="请选择或扫码"
          @click="showEntityPicker = true"
          :rules="[{ required: true, message: '请选择经营主体' }]"
        />
      </van-cell-group>

      <van-cell-group inset title="更正内容">
        <van-field
          v-model="form.fieldLabel"
          is-link
          readonly
          name="field"
          label="更正字段"
          placeholder="请选择"
          @click="showFieldPicker = true"
          :rules="[{ required: true, message: '请选择更正字段' }]"
        />
        <van-field
          v-model="form.oldValue"
          name="oldValue"
          label="原值"
          placeholder="当前值（自动获取）"
          readonly
        />
        <van-field
          v-model="form.newValue"
          name="newValue"
          label="新值"
          placeholder="请输入更正后的值"
          :rules="[{ required: true, message: '请输入新值' }]"
        />
      </van-cell-group>

      <van-cell-group inset title="申请说明">
        <van-field
          v-model="form.reason"
          type="textarea"
          name="reason"
          label="更正原因"
          placeholder="请说明更正原因..."
          rows="3"
          :rules="[{ required: true, message: '请输入更正原因' }]"
        />
        <van-field
          v-model="form.submitterPhone"
          name="phone"
          label="联系电话"
          placeholder="方便联系核实"
        />
      </van-cell-group>

      <van-cell-group inset title="证明材料（选填）">
        <div class="upload-wrap">
          <van-uploader v-model="form.evidence" :max-count="3" accept="image/*" />
        </div>
      </van-cell-group>

      <div class="submit-btn">
        <van-button type="primary" native-type="submit" block round :loading="submitting">
          提交申请
        </van-button>
      </div>
    </van-form>

    <!-- 字段选择器 -->
    <van-popup v-model:show="showFieldPicker" position="bottom" round>
      <van-picker
        title="选择更正字段"
        :columns="fieldOptions"
        @confirm="onFieldConfirm"
        @cancel="showFieldPicker = false"
      />
    </van-popup>

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
import { useRouter, useRoute } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import { infoCorrectionsApi, entitiesApi } from '@/api/index'

const router = useRouter()
const route = useRoute()

const submitting = ref(false)
const showFieldPicker = ref(false)
const showEntityPicker = ref(false)
const activeTab = ref(0)

const form = ref({
  entityId: '',
  entityName: '',
  fieldName: '',
  fieldLabel: '',
  oldValue: '',
  newValue: '',
  reason: '',
  submitterPhone: '',
  evidence: [],
})

const fieldOptions = [
  { text: '主体名称', value: 'name' },
  { text: '地址', value: 'address' },
  { text: '法定代表人', value: 'legalPerson' },
  { text: '联系电话', value: 'phone' },
  { text: '经营范围', value: 'businessScope' },
]

function onFieldConfirm({ selectedOptions }) {
  const opt = selectedOptions[0]
  form.value.fieldName = opt.value
  form.value.fieldLabel = opt.text
  showFieldPicker.value = false

  // 如果已加载实体，自动填充原值
  if (form.value.entityId && form.value.oldValue === '') {
    loadOldValue()
  }
}

async function loadOldValue() {
  // 从实体数据中获取原值
  try {
    const res = await entitiesApi.get(form.value.entityId)
    const entity = res.data
    form.value.oldValue = entity[form.value.fieldName] || ''
  } catch (e) {
    console.error('获取原值失败', e)
  }
}

async function handleSubmit() {
  if (!form.value.entityId) {
    showFailToast('请选择经营主体')
    return
  }

  submitting.value = true
  try {
    const payload = {
      entityId: form.value.entityId,
      fieldName: form.value.fieldName,
      oldValue: form.value.oldValue,
      newValue: form.value.newValue,
      reason: form.value.reason,
      submitterPhone: form.value.submitterPhone,
      evidence: form.value.evidence.map(e => e.url || e.content).filter(Boolean).join(','),
    }

    await infoCorrectionsApi.create(payload)
    showSuccessToast('申请提交成功')
    router.back()
  } catch (e) {
    showFailToast(e.response?.data?.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  // 如果从主体详情页跳转，自动填充实体信息
  const entityId = route.query.entityId
  const entityName = route.query.entityName
  if (entityId) {
    form.value.entityId = entityId
    form.value.entityName = entityName || entityId
  }
})
</script>

<style scoped>
.info-correction-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 60px;
}

.upload-wrap {
  padding: 16px;
}

.submit-btn {
  margin: 24px 16px;
}
</style>
