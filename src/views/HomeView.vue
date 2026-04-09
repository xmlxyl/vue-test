<script setup lang="ts">
import { getToken } from '@/lib/auth'
</script>

<template>
  <div class="home">
    <h1 class="title">首页</h1>
    <p class="lead">已登录。左侧菜单可进入各业务页面。</p>
    <p class="label">Token 预览（前 24 个字符）</p>
    <pre class="token">{{ (getToken() ?? '').slice(0, 24) }}{{ (getToken() ?? '').length > 24 ? '…' : '' }}</pre>
    <p class="tip">未登录访问受保护页面会跳转到登录页。</p>
  </div>
</template>

<style scoped>
.home {
  max-width: 720px;
}

.title {
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.lead {
  margin: 0 0 1.25rem;
  color: #475569;
  font-size: 0.95rem;
}

.label {
  margin: 0 0 0.35rem;
  font-size: 0.8rem;
  color: #64748b;
}

.token {
  margin: 0 0 1rem;
  padding: 1rem;
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.85rem;
}

.tip {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
}
</style>
