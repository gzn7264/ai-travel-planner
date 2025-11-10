import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/plan',
    name: 'Plan',
    component: () => import('../views/PlanView.vue')
  },
  {
    path: '/budget',
    name: 'Budget',
    component: () => import('../views/BudgetView.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫，处理未登录访问需要权限的页面
router.beforeEach((to, from, next) => {
  // TODO: 实现登录状态检查逻辑
  const isLoggedIn = false // 暂时设为false
  const requiresAuth = !['Login', 'Register'].includes(to.name)
  
  if (requiresAuth && !isLoggedIn) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router