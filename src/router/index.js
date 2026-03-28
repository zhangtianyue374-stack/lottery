import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/user/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/user/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/pages/user/Register.vue'),
    meta: { guest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/user/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/bind',
    name: 'BindOrders',
    component: () => import('@/pages/user/BindOrders.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/lottery',
    name: 'Lottery',
    component: () => import('@/pages/user/Lottery.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/records',
    name: 'Records',
    component: () => import('@/pages/user/Records.vue'),
    meta: { requiresAuth: true }
  },
  // 管理后台
  {
    path: '/admin',
    name: 'AdminLogin',
    component: () => import('@/pages/admin/Login.vue'),
    meta: { adminGuest: true }
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAdmin: true },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/pages/admin/Overview.vue')
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('@/pages/admin/Orders.vue')
      },
      {
        path: 'lottery',
        name: 'AdminLottery',
        component: () => import('@/pages/admin/Lottery.vue')
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/pages/admin/Users.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 管理员路由守卫
const adminToken = localStorage.getItem('adminToken')

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 如果有用户token但没有用户信息，先获取
  if (authStore.token && !authStore.user) {
    authStore.fetchUser()
  }

  // 需要登录的页面
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/login')
    return
  }

  // 只允许未登录用户访问的页面
  if (to.meta.guest && authStore.isLoggedIn) {
    next('/dashboard')
    return
  }

  // 管理后台路由守卫
  if (to.path === '/admin' && !to.meta.requiresAdmin) {
    // 管理员登录页，如果已有token则跳转
    if (adminToken) {
      next('/admin/dashboard')
      return
    }
  }

  next()
})

export default router
