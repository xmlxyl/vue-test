<script setup lang="ts">
import { useRouter, RouterLink, RouterView } from 'vue-router'
import { clearToken } from '@/lib/auth'

const router = useRouter()

const nav = [
  { to: { name: 'home' }, label: '首页' },
  { to: { name: 'products' }, label: '产品管理' },
  { to: { name: 'inventory' }, label: '库存管理' },
  { to: { name: 'thirdPartyApi' }, label: '第三方 API 管理' },
]

function logout() {
  clearToken()
  router.replace({ name: 'login' })
}
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">管理后台</div>
      <nav class="nav">
        <RouterLink
          v-for="item in nav"
          :key="JSON.stringify(item.to)"
          :to="item.to"
          class="nav-item"
          active-class="nav-item--active"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
    </aside>

    <div class="main">
      <header class="topbar">
        <span class="topbar-title">控制台</span>
        <button type="button" class="logout" @click="logout">退出登录</button>
      </header>
      <div class="page">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background: #f1f5f9;
  color: #0f172a;
}

.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #0f172a;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
}

.brand {
  padding: 1.25rem 1rem;
  font-weight: 600;
  font-size: 1rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
}

.nav {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0.5rem;
  gap: 0.25rem;
}

.nav-item {
  display: block;
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.9rem;
  transition:
    background 0.15s,
    color 0.15s;
}

.nav-item:hover {
  color: #e2e8f0;
  background: rgba(148, 163, 184, 0.12);
}

.nav-item--active {
  color: #f8fafc;
  background: rgba(56, 189, 248, 0.2);
}

.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
}

.topbar-title {
  font-size: 1rem;
  font-weight: 600;
}

.logout {
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #fff;
  cursor: pointer;
  font-size: 0.875rem;
}

.logout:hover {
  background: #f8fafc;
}

.page {
  flex: 1;
  padding: 1.5rem;
  overflow: auto;
}
</style>
