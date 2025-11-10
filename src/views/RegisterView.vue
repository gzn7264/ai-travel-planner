<template>
  <div class="register-container">
    <div class="register-form">
      <h2>创建账户</h2>
      <p>加入我们，开始智能旅行规划之旅</p>
      
      <div class="form-group">
        <label for="username">用户名</label>
        <input 
          type="text" 
          id="username" 
          v-model="registerForm.username"
          placeholder="请设置用户名"
        >
      </div>
      
      <div class="form-group">
        <label for="email">邮箱</label>
        <input 
          type="email" 
          id="email" 
          v-model="registerForm.email"
          placeholder="请输入邮箱地址"
        >
      </div>
      
      <div class="form-group">
        <label for="password">密码</label>
        <input 
          type="password" 
          id="password" 
          v-model="registerForm.password"
          placeholder="请设置密码（至少8位）"
        >
      </div>
      
      <div class="form-group">
        <label for="confirmPassword">确认密码</label>
        <input 
          type="password" 
          id="confirmPassword" 
          v-model="registerForm.confirmPassword"
          placeholder="请再次输入密码"
        >
      </div>
      
      <button 
        class="register-btn" 
        @click="register"
        :disabled="isLoading"
      >
        {{ isLoading ? '注册中...' : '注册' }}
      </button>
      
      <div class="login-link">
        <p>已有账户？ <router-link to="/login">立即登录</router-link></p>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <!-- 成功提示 -->
      <div v-if="success" class="success-message">
        {{ success }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../services/api'

const router = useRouter()

const isLoading = ref(false)
const error = ref('')
const success = ref('')

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const register = async () => {
  // 验证表单
  if (!validateForm()) {
    return
  }
  
  isLoading.value = true
  error.value = ''
  success.value = ''
  
  try {
    // 调用注册API
    await auth.register(
      registerForm.email, 
      registerForm.password, 
      registerForm.username
    )
    
    success.value = '注册成功！正在跳转到登录页面...'
    
    // 注册成功后跳转到登录页
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err) {
    error.value = err.message || '注册失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 表单验证
const validateForm = () => {
  // 检查用户名
  if (!registerForm.username) {
    error.value = '请输入用户名'
    return false
  }
  
  // 检查邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!registerForm.email || !emailRegex.test(registerForm.email)) {
    error.value = '请输入有效的邮箱地址'
    return false
  }
  
  // 检查密码长度
  if (!registerForm.password || registerForm.password.length < 8) {
    error.value = '密码长度至少为8位'
    return false
  }
  
  // 检查密码是否匹配
  if (registerForm.password !== registerForm.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return false
  }
  
  return true
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.register-form {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.register-form h2 {
  margin-bottom: 10px;
  color: #333;
}

.register-form p {
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

.register-btn {
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

.register-btn:hover:not(:disabled) {
  background: #764ba2;
}

.register-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 20px;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
}

.login-link a:hover {
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

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 10px;
  border-radius: 5px;
  margin-top: 20px;
  text-align: center;
}
</style>