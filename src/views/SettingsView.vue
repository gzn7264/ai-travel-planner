<template>
  <div class="settings-container">
    <h1>设置</h1>
    
    <div class="settings-content">
      <!-- API密钥设置 -->
      <div class="settings-section">
        <h2>API 密钥设置</h2>
        <div class="api-key-form">
          <div class="form-group">
            <label for="xunfei-key">科大讯飞 API 密钥</label>
            <input 
              type="text" 
              id="xunfei-key" 
              v-model="apiKeys.xunfei"
              placeholder="输入科大讯飞API密钥"
            >
            <p class="helper-text">用于语音识别功能</p>
          </div>
          
          <div class="form-group">
            <label for="map-key">地图 API 密钥</label>
            <input 
              type="text" 
              id="map-key" 
              v-model="apiKeys.map"
              placeholder="输入高德或百度地图API密钥"
            >
            <p class="helper-text">用于地图显示和导航功能</p>
          </div>
          
          <div class="form-group">
            <label for="llm-key">大语言模型 API 密钥</label>
            <input 
              type="text" 
              id="llm-key" 
              v-model="apiKeys.llm"
              placeholder="输入大语言模型API密钥"
            >
            <p class="helper-text">用于智能行程规划和预算分析</p>
          </div>
          
          <button class="btn-primary" @click="saveApiKeys">保存设置</button>
        </div>
      </div>
      
      <!-- 用户信息 -->
      <div v-if="userStore.user" class="settings-section">
        <h2>用户信息</h2>
        <div class="user-info">
          <p><strong>用户名:</strong> {{ userStore.user.username }}</p>
          <p><strong>邮箱:</strong> {{ userStore.user.email }}</p>
          <button class="btn-secondary" @click="updatePassword">修改密码</button>
        </div>
      </div>
      
      <!-- 数据同步设置 -->
      <div class="settings-section">
        <h2>数据同步</h2>
        <div class="sync-settings">
          <label class="switch">
            <input type="checkbox" v-model="autoSync">
            <span class="slider"></span>
            自动同步数据
          </label>
          <p class="helper-text">开启后，您的数据将自动同步到云端</p>
          <button class="btn-secondary" @click="manualSync">立即同步</button>
        </div>
      </div>
      
      <!-- 关于 -->
      <div class="settings-section">
        <h2>关于</h2>
        <div class="about-info">
          <p>AI 旅行规划师 v1.0.0</p>
          <p>简化旅行规划，智能推荐行程</p>
          <p>© 2024 AI Travel Planner</p>
        </div>
      </div>
      
      <!-- 登出按钮 -->
      <button class="btn-danger" @click="logout">退出登录</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/userStore'

const router = useRouter()
const userStore = useUserStore()

const apiKeys = reactive({
  xunfei: '',
  map: '',
  llm: ''
})

const autoSync = ref(true)

// 保存API密钥
const saveApiKeys = () => {
  // 保存每个API密钥
  Object.entries(apiKeys).forEach(([type, key]) => {
    if (key) {
      userStore.saveApiKey(type, key)
    }
  })
  
  alert('API密钥保存成功')
}

// 修改密码
const updatePassword = () => {
  // TODO: 实现密码修改逻辑
  alert('密码修改功能开发中')
}

// 手动同步数据
const manualSync = async () => {
  // TODO: 实现数据同步逻辑
  try {
    // 模拟同步操作
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('数据同步成功')
  } catch (error) {
    alert('数据同步失败: ' + error.message)
  }
}

// 退出登录
const logout = () => {
  if (confirm('确定要退出登录吗？')) {
    userStore.logout()
    router.push('/login')
  }
}

// 加载用户设置
onMounted(() => {
  // 加载用户数据和API密钥
  userStore.loadUserData()
  
  // 填充API密钥表单
  Object.keys(apiKeys).forEach(type => {
    apiKeys[type] = userStore.getApiKey(type)
  })
  
  // TODO: 加载自动同步设置
})
</script>

<style scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.settings-section {
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.helper-text {
  font-size: 14px;
  color: #6c757d;
  margin-top: 5px;
}

.user-info p {
  margin: 10px 0;
}

.sync-settings {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Switch toggle styles */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #667eea;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
  margin-top: 10px;
}

.btn-primary:hover {
  background: #764ba2;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  color: white;
  align-self: flex-start;
}

.btn-danger:hover {
  background: #c82333;
}

.about-info p {
  margin: 8px 0;
  color: #6c757d;
}
</style>