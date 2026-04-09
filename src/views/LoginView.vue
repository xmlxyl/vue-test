<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loginRequest } from '@/api/auth'
import { setToken } from '@/lib/auth'

const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const apiHint = computed(() => {
  const base = import.meta.env.VITE_API_BASE_URL ?? '(空，走相对路径与代理)'
  const path = import.meta.env.VITE_LOGIN_PATH ?? '/api/auth/login'
  return `${base}${path}`
})

async function onSubmit() {
  errorMsg.value = ''
  if (!username.value.trim() || !password.value) {
    errorMsg.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  try {
    const { token, raw } = await loginRequest(username.value.trim(), password.value)
    if (!token) {
      console.warn('登录成功但未解析到 token，完整响应：', raw)
      errorMsg.value =
        '接口返回成功，但未识别 token 字段。请打开控制台查看响应，或在 src/lib/auth.ts 中扩展 pickTokenFromResponse。'
      return
    }
    setToken(token)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(redirect || '/')
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="card">
      <h1>登录</h1>
      <p class="hint">当前请求：<code>{{ apiHint }}</code></p>

      <form class="form" @submit.prevent="onSubmit">
        <label class="field">
          <span>用户名</span>
          <input v-model="username" type="text" autocomplete="username" placeholder="username" />
        </label>
        <label class="field">
          <span>密码</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="password"
          />
        </label>

        <p v-if="errorMsg" class="error" role="alert">{{ errorMsg }}</p>

        <button type="submit" class="submit" :disabled="loading">
          {{ loading ? '登录中…' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: linear-gradient(145deg, #0f172a 0%, #1e293b 45%, #0f172a 100%);
}

.card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);
  color: #e2e8f0;
}

h1 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.hint {
  margin: 0 0 1.5rem;
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.4;
  word-break: break-all;
}

.hint code {
  font-size: 0.75rem;
  color: #7dd3fc;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.875rem;
  color: #cbd5e1;
}

.field input {
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #334155;
  background: #0f172a;
  color: #f1f5f9;
  font-size: 1rem;
}

.field input:focus {
  outline: none;
  border-color: #38bdf8;
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.25);
}

.error {
  margin: 0;
  font-size: 0.85rem;
  color: #fca5a5;
}

.submit {
  margin-top: 0.25rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(90deg, #0ea5e9, #22d3ee);
  color: #0f172a;
}

.submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.submit:not(:disabled):hover {
  filter: brightness(1.05);
}
</style>
