<template>
  <div class="login-container">
    <div class="login-form">
      <h2>欢迎回来</h2>
      <p>登录您的账户开始智能旅行规划</p>
      
      <div class="form-group">
        <label for="email">邮箱</label>
        <input 
          type="email" 
          id="email" 
          v-model="loginForm.email"
          placeholder="请输入邮箱地址"
        >
      </div>
      
      <div class="form-group">
        <label for="password">密码</label>
        <input 
          type="password" 
          id="password" 
          v-model="loginForm.password"
          placeholder="请输入密码"
        >
      </div>
      
      <div class="form-options">
        <label class="remember-me">
          <input type="checkbox" v-model="rememberMe">
          记住我
        </label>
        <a href="#" class="forgot-password">忘记密码？</a>
      </div>
      
      <button 
        class="login-btn" 
        @click="login"
        :disabled="isLoading"
      >
        {{ isLoading ? '登录中...' : '登录' }}
      </button>
      
      <div class="register-link">
        <p>还没有账户？ <router-link to="/register">立即注册</router-link></p>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/userStore'
import { auth } from '../services/api'

const router = useRouter()
const userStore = useUserStore()

const isLoading = ref(false)
const error = ref('')
const rememberMe = ref(false)

const loginForm = reactive({
  email: '',
  password: ''
})

const login = async () => {
  // 验证表单
  if (!loginForm.email || !loginForm.password) {
    error.value = '请输入邮箱和密码'
    return
  }
  
  isLoading.value = true
  error.value = ''
  
  try {
    // 调用用户存储中的登录方法
    const result = await userStore.login({
      email: loginForm.email,
      password: loginForm.password
    })
    
    if (result.success) {
      // 根据需要保存记住我设置
      if (rememberMe.value) {
        localStorage.setItem('remember_me', 'true')
      } else {
        localStorage.removeItem('remember_me')
      }
      
      // 加载用户数据
      userStore.loadUserData()
    
    // 跳转到首页
      router.push('/')
    } else {
      // 登录失败，显示错误信息
      error.value = result.error || '登录失败，请检查用户名和密码'
    }
  } catch (err) {
    error.value = err.message || '登录失败，请稍后重试'
    console.error('登录错误:', err)
  } finally {
    isLoading.value = false
  }
}

// 检查是否记住了用户
if (localStorage.getItem('remember_me') === 'true') {
  rememberMe.value = true
  // 可以在这里预填充邮箱
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.login-form {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.login-form h2 {
  margin-bottom: 10px;
  color: #333;
}

.login-form p {
  margin-bottom: 30px;
  color: #666;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.forgot-password {
  color: #667eea;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.login-btn:hover:not(:disabled) {
  background: #764ba2;
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 20px;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 5px;
  margin-top: 20px;
  text-align: center;
}
</style>