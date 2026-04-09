import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/lib/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('@/views/ProductManagementView.vue'),
        },
        {
          path: 'inventory',
          name: 'inventory',
          component: () => import('@/views/InventoryManagementView.vue'),
        },
        {
          path: 'third-party-api',
          name: 'thirdPartyApi',
          component: () => import('@/views/ThirdPartyApiView.vue'),
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const token = getToken()
  if (to.meta.requiresAuth && !token) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && token) {
    return { path: '/' }
  }
  return true
})

export default router
