<template>
  <div class="login-page">
    <div class="login-header">
      <div class="logo">食品安全监管</div>
      <p class="subtitle">一店一码 · 智慧监管</p>
    </div>
    <van-form @submit="onSubmit" class="login-form">
      <van-cell-group inset>
        <van-field v-model="username" name="username" label="用户名" placeholder="请输入用户名" :rules="[{ required: true, message: '请输入用户名' }]" />
        <van-field v-model="password" type="password" name="password" label="密码" placeholder="请输入密码" :rules="[{ required: true, message: '请输入密码' }]" />
      </van-cell-group>
      <div class="login-btn-wrap">
        <van-button round block type="primary" native-type="submit" :loading="loading">登录</van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/api/index'
import { showToast } from 'vant'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)

const onSubmit = async () => {
  loading.value = true
  try {
    const res = await authApi.login(username.value, password.value)
    localStorage.setItem('token', res.token)
    showToast({ message: '登录成功', type: 'success' })
    router.replace('/')
  } catch (err) {
    const msg = err.response?.data?.message || '登录失败，请检查用户名和密码'
    showToast({ message: msg })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page { min-height:100vh; background:linear-gradient(135deg,#1989fa,#07c160); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px }
.login-header { text-align:center; margin-bottom:40px }
.logo { font-size:28px; font-weight:bold; color:#fff; margin-bottom:8px }
.subtitle { color:rgba(255,255,255,0.8); font-size:14px }
.login-form { width:100%; max-width:360px }
.login-btn-wrap { margin:24px 16px }
</style>