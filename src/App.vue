<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from './store/userStore'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 检查用户是否已登录
const isAuthenticated = computed(() => userStore.isAuthenticated)

// 登出处理
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    userStore.logout()
    router.push('/login')
  }
}

// 组件挂载时加载用户数据
onMounted(() => {
  userStore.loadUserData()
})
</script>

<template>
  <div class="app-container">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="logo" @click="router.push('/')">
          AI 旅行规划师
        </div>
        
        <div class="nav-links" v-if="isAuthenticated">
          <router-link to="/">首页</router-link>
          <router-link to="/plan">创建计划</router-link>
          <router-link to="/budget">预算管理</router-link>
          <router-link to="/speech-test">语音测试</router-link>
          <router-link to="/settings">设置</router-link>
          <button class="logout-btn" @click="handleLogout">退出</button>
        </div>
        
        <div class="nav-links" v-else>
          <router-link to="/login">登录</router-link>
          <router-link to="/register">注册</router-link>
          <router-link to="/speech-test">语音测试</router-link>
        </div>
      </div>
    </nav>
    
    <!-- 主要内容区 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- 页脚 -->
    <footer class="footer">
      <p>© 2024 AI 旅行规划师 - 让旅行更简单</p>
    </footer>
  </div>
</template>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f7fa;
  color: #333;
  line-height: 1.6;
}

/* 应用容器 */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 导航栏样式 */
.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  cursor: pointer;
}

.nav-links {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-links a:hover {
  color: #667eea;
  background: #f5f7fa;
}

.logout-btn {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: #c82333;
}

/* 主要内容区 */
.main-content {
  flex: 1;
  padding: 20px 0;
}

/* 页脚 */
.footer {
  background: #333;
  color: white;
  text-align: center;
  padding: 20px;
  margin-top: auto;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    height: auto;
    padding: 15px;
  }
  
  .nav-links {
    margin-top: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
