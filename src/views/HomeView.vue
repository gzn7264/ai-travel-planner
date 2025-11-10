<template>
  <div class="home-container">
    <header class="hero-section">
      <h1>AI 旅行规划师</h1>
      <p>让人工智能为您打造完美的旅行体验</p>
      <button class="create-plan-btn" @click="navigateToPlan">开始规划</button>
    </header>

    <section class="features-section">
      <div class="feature-card">
        <h3>智能行程规划</h3>
        <p>通过语音或文字输入您的需求，AI将自动生成详细的旅行路线</p>
      </div>
      <div class="feature-card">
        <h3>费用预算管理</h3>
        <p>智能预算分析和实时开销记录，让您的旅行财务一目了然</p>
      </div>
      <div class="feature-card">
        <h3>个性化推荐</h3>
        <p>根据您的喜好和需求，推荐最合适的景点、餐厅和活动</p>
      </div>
    </section>

    <section class="recent-plans" v-if="planList.length > 0">
      <h2>最近的旅行计划</h2>
      <div class="plan-list">
        <div 
          v-for="plan in planList" 
          :key="plan.id" 
          class="plan-card"
          @click="openPlan(plan.id)"
        >
          <h3>{{ plan.title }}</h3>
          <p>{{ plan.destination }} · {{ formatDateRange(plan.startDate, plan.endDate) }}</p>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>体验语音规划</h2>
      <div class="speech-demo">
        <button 
          class="speech-btn" 
          :class="{ recording: isRecording }"
          @click="toggleSpeechRecognition"
        >
          {{ isRecording ? '停止录音' : '开始语音输入' }}
        </button>
        <div v-if="recognizedText" class="recognized-text">
          <p>识别结果: {{ recognizedText }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlanStore } from '../store/planStore'
import { speechRecognitionService } from '../services/speechService'
import { useUserStore } from '../store/userStore'

const router = useRouter()
const planStore = usePlanStore()
const userStore = useUserStore()

const isRecording = ref(false)
const recognizedText = ref('')

// 导航到创建计划页面
const navigateToPlan = () => {
  router.push('/plan')
}

// 打开指定计划
const openPlan = (planId) => {
  router.push(`/plan?id=${planId}`)
}

// 格式化日期范围
const formatDateRange = (startDate, endDate) => {
  // TODO: 实现日期格式化逻辑
  return `${startDate} 至 ${endDate}`
}

// 切换语音识别
const toggleSpeechRecognition = async () => {
  try {
    if (isRecording.value) {
      // 停止录音
      const audioBlob = await speechRecognitionService.stopRecording()
      isRecording.value = false
      
      // 进行语音识别
      const apiKey = userStore.getApiKey('xunfei')
      if (!apiKey) {
        alert('请先在设置页面配置语音识别API密钥')
        return
      }
      speechRecognitionService.setApiKey(apiKey)
      const text = await speechRecognitionService.recognizeSpeech(audioBlob)
      recognizedText.value = text
      
      // 解析语音指令并导航到计划页面
      const parsedData = speechRecognitionService.parseSpeechCommand(text)
      if (parsedData.destination) {
        // 跳转到计划页面并传递参数
        router.push({ path: '/plan', query: parsedData })
      }
    } else {
      // 开始录音
      await speechRecognitionService.startRecording()
      isRecording.value = true
      recognizedText.value = ''
    }
  } catch (error) {
    console.error('语音识别错误:', error)
    alert('语音识别失败: ' + error.message)
    isRecording.value = false
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  // 加载用户数据
  userStore.loadUserData()
  
  // 加载旅行计划列表
  if (userStore.isAuthenticated) {
    await planStore.loadPlans()
  }
})
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.hero-section {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
  margin-bottom: 40px;
}

.hero-section h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.hero-section p {
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.create-plan-btn {
  background: white;
  color: #667eea;
  border: none;
  padding: 12px 24px;
  font-size: 1.1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.create-plan-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.features-section {
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
}

.feature-card {
  flex: 1;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.feature-card h3 {
  color: #667eea;
  margin-bottom: 10px;
}

.recent-plans h2 {
  margin-bottom: 20px;
  color: #333;
}

.plan-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.plan-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.plan-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.demo-section {
  text-align: center;
  margin-top: 60px;
}

.speech-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.1rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
}

.speech-btn:hover {
  background: #764ba2;
}

.speech-btn.recording {
  background: #ff4757;
  animation: pulse 1.5s infinite;
}

.recognized-text {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 5px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>