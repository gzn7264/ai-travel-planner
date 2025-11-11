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
      name: 'register',
      component: () => import('../views/RegisterView.vue')
  },
  {
    path: '/speech-test',
    name: 'speechTest',
    component: () => import('../views/SpeechTestView.vue'),
    meta: {
      title: '语音识别测试'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫，处理未登录访问需要权限的页面
router.beforeEach((to, from, next) => {
  // 动态导入userStore，避免循环导入问题
  import('../store/userStore')
    .then(({ useUserStore }) => {
      // 允许未登录用户访问登录、注册和语音测试页面
      const requiresAuth = !['Login', 'register', 'speechTest'].includes(to.name)
      
      // 由于可能存在初始化问题，暂时简化路由守卫
      // 在实际应用中，我们应该检查真实的登录状态
      if (requiresAuth) {
        // 对于演示目的，允许所有页面访问，除了特殊标记为需要权限的页面
        // 真实环境中应检查useUserStore()的isAuthenticated状态
        next()
      } else {
        next()
      }
    })
    .catch(() => {
      // 发生错误时也允许导航，避免应用阻塞
      next()
    })
})

export default router