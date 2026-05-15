<template>
  <div class="login-bg">
    <v-card class="login-card" elevation="8">
      <div class="text-center pa-6 pb-4">
        <v-avatar color="primary" size="72" class="mb-4">
          <span class="text-h3 text-white font-weight-bold">食</span>
        </v-avatar>
        <h1 class="text-h5 font-weight-bold text-primary mb-1">一店一码监管系统</h1>
        <p class="text-body-2 text-medium-emphasis">食品安全数字化监管平台</p>
      </div>

      <v-card-text class="px-6 pb-0">
        <v-text-field v-model="form.username" label="用户名" prepend-inner-icon="mdi-account" variant="outlined" density="comfortable" class="mb-2" />
        <v-text-field v-model="form.password" label="密码" prepend-inner-icon="mdi-lock" variant="outlined" density="comfortable" :type="showPassword ? 'text' : 'password'" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="showPassword = !showPassword" @keyup.enter="handleLogin" />
      </v-card-text>

      <v-card-actions class="px-6 py-4">
        <v-btn block color="primary" size="large" :loading="loading" @click="handleLogin">
          登录
        </v-btn>
      </v-card-actions>

      <v-alert v-if="errorMsg" type="error" variant="tonal" class="ma-4 mt-0" density="compact">{{ errorMsg }}</v-alert>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../services/api'

const router = useRouter()
const form = ref({ username: '', password: '' })
const loading = ref(false)
const showPassword = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    errorMsg.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    const res: any = await authApi.login(form.value.username, form.value.password)
    localStorage.setItem('token', res.token || res.data?.token || '')
    localStorage.setItem('username', form.value.username)
    router.push('/dashboard')
  } catch (e: any) {
    errorMsg.value = e?.response?.data?.message || e?.message || '登录失败，请检查用户名和密码'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
}
.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 16px !important;
}
</style>