<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">mdi-cog</v-icon>
      系统设置
    </v-card-title>
    <v-card-text>
      <v-tabs v-model="tab" color="primary">
        <v-tab value="basic">基本设置</v-tab>
        <v-tab value="notification">通知设置</v-tab>
        <v-tab value="security">安全设置</v-tab>
      </v-tabs>
      <v-window v-model="tab" class="mt-4">
        <v-window-item value="basic">
          <v-form>
            <v-text-field v-model="settings.systemName" label="系统名称" variant="outlined" class="mb-3" />
            <v-text-field v-model="settings.adminEmail" label="管理员邮箱" variant="outlined" class="mb-3" />
            <v-select v-model="settings.language" :items="['中文', 'English']" label="系统语言" variant="outlined" class="mb-3" />
            <v-btn color="primary" @click="saveSettings">保存设置</v-btn>
          </v-form>
        </v-window-item>
        <v-window-item value="notification">
          <v-form>
            <v-switch v-model="settings.emailNotify" label="邮件通知" color="primary" />
            <v-switch v-model="settings.smsNotify" label="短信通知" color="primary" />
            <v-text-field v-model="settings.notifyPhone" label="通知手机号" variant="outlined" class="mb-3" />
            <v-btn color="primary" @click="saveSettings">保存设置</v-btn>
          </v-form>
        </v-window-item>
        <v-window-item value="security">
          <v-form>
            <v-text-field v-model="settings.oldPassword" label="旧密码" type="password" variant="outlined" class="mb-3" />
            <v-text-field v-model="settings.newPassword" label="新密码" type="password" variant="outlined" class="mb-3" />
            <v-text-field v-model="settings.confirmPassword" label="确认密码" type="password" variant="outlined" class="mb-3" />
            <v-btn color="primary" @click="changePassword">修改密码</v-btn>
          </v-form>
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tab = ref('basic')

const settings = ref({
  systemName: '一店一码监管系统',
  adminEmail: 'admin@example.com',
  language: '中文',
  emailNotify: true,
  smsNotify: false,
  notifyPhone: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const saveSettings = () => { alert('设置已保存（演示）') }
const changePassword = () => { alert('密码已修改（演示）') }
</script>
