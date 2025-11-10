<template>
  <div class="plan-container">
    <h1>{{ editingPlan ? '编辑旅行计划' : '创建旅行计划' }}</h1>
    
    <div class="plan-form">
      <div class="form-group">
        <label for="title">旅行标题</label>
        <input 
          type="text" 
          id="title" 
          v-model="planForm.title"
          placeholder="给您的旅行起个名字"
        >
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="destination">目的地</label>
          <input 
            type="text" 
            id="destination" 
            v-model="planForm.destination"
            placeholder="例如：日本东京"
          >
        </div>
        
        <div class="form-group">
          <label for="travelers">同行人数</label>
          <input 
            type="number" 
            id="travelers" 
            v-model.number="planForm.travelers"
            min="1"
          >
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="startDate">开始日期</label>
          <input 
            type="date" 
            id="startDate" 
            v-model="planForm.startDate"
          >
        </div>
        
        <div class="form-group">
          <label for="endDate">结束日期</label>
          <input 
            type="date" 
            id="endDate" 
            v-model="planForm.endDate"
          >
        </div>
        
        <div class="form-group">
          <label for="budget">预算 (元)</label>
          <input 
            type="number" 
            id="budget" 
            v-model.number="planForm.budget"
            min="0"
          >
        </div>
      </div>
      
      <div class="form-group">
        <label>旅行偏好</label>
        <div class="preferences">
          <label v-for="pref in availablePreferences" :key="pref">
            <input 
              type="checkbox" 
              :value="pref"
              v-model="planForm.preferences"
            >
            {{ pref }}
          </label>
        </div>
      </div>
      
      <div class="form-group">
        <label for="notes">备注</label>
        <textarea 
          id="notes" 
          v-model="planForm.notes"
          placeholder="其他需求或特殊说明"
          rows="3"
        ></textarea>
      </div>
      
      <div class="speech-input">
        <button 
          class="speech-btn" 
          :class="{ recording: isRecording }"
          @click="toggleSpeechInput"
        >
          {{ isRecording ? '停止录音' : '语音输入' }}
        </button>
        <p v-if="speechInputText">{{ speechInputText }}</p>
      </div>
      
      <div class="form-actions">
        <button class="btn-primary" @click="generatePlan">
          {{ planStore.loading ? '生成中...' : 'AI生成计划' }}
        </button>
        <button class="btn-secondary" @click="savePlan">
          保存计划
        </button>
      </div>
    </div>
    
    <!-- 生成的行程展示 -->
    <div v-if="generatedItinerary" class="itinerary-result">
      <h2>AI 生成的行程</h2>
      <div class="itinerary-days">
        <div v-for="(day, index) in generatedItinerary" :key="index" class="itinerary-day">
          <h3>第 {{ index + 1 }} 天</h3>
          <div class="activities">
            <div v-for="(activity, actIndex) in day.activities" :key="actIndex" class="activity">
              {{ activity }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePlanStore } from '../store/planStore'
import { speechRecognitionService } from '../services/speechService'
import { useUserStore } from '../store/userStore'

const router = useRouter()
const route = useRoute()
const planStore = usePlanStore()
const userStore = useUserStore()

const isRecording = ref(false)
const speechInputText = ref('')
const generatedItinerary = ref(null)
const editingPlan = computed(() => !!route.query.id)

// 可用的旅行偏好
const availablePreferences = [
  '美食', '购物', '历史文化', '自然风光', '博物馆',
  '主题公园', '冒险活动', '艺术展览', '夜生活', '休闲度假'
]

// 表单数据
const planForm = reactive({
  title: '',
  destination: '',
  startDate: '',
  endDate: '',
  budget: 0,
  travelers: 1,
  preferences: [],
  notes: ''
})

// 切换语音输入
const toggleSpeechInput = async () => {
  try {
    if (isRecording.value) {
      const audioBlob = await speechRecognitionService.stopRecording()
      isRecording.value = false
      
      const apiKey = userStore.getApiKey('xunfei')
      if (!apiKey) {
        alert('请先在设置页面配置语音识别API密钥')
        return
      }
      speechRecognitionService.setApiKey(apiKey)
      const text = await speechRecognitionService.recognizeSpeech(audioBlob)
      speechInputText.value = text
      
      // 解析语音输入并填充表单
      const parsedData = speechRecognitionService.parseSpeechCommand(text)
      fillFormFromSpeech(parsedData)
    } else {
      await speechRecognitionService.startRecording()
      isRecording.value = true
      speechInputText.value = ''
    }
  } catch (error) {
    console.error('语音输入错误:', error)
    alert('语音输入失败: ' + error.message)
    isRecording.value = false
  }
}

// 从语音解析结果填充表单
const fillFormFromSpeech = (parsedData) => {
  if (parsedData.destination) planForm.destination = parsedData.destination
  if (parsedData.days) {
    // 根据天数计算结束日期
    const today = new Date()
    planForm.startDate = formatDate(today)
    const endDate = new Date(today)
    endDate.setDate(today.getDate() + parsedData.days - 1)
    planForm.endDate = formatDate(endDate)
  }
  if (parsedData.budget) planForm.budget = parsedData.budget
  if (parsedData.preferences) planForm.preferences = parsedData.preferences
  if (parsedData.travelers) planForm.travelers = parsedData.travelers
  if (parsedData.hasChildren && !planForm.preferences.includes('亲子游')) {
    planForm.preferences.push('亲子游')
  }
}

// 格式化日期
const formatDate = (date) => {
  return date.toISOString().split('T')[0]
}

// AI生成计划
const generatePlan = async () => {
  // 验证表单
  if (!validateForm()) return
  
  try {
    const success = await planStore.generatePlanWithAI({
      ...planForm,
      // 计算天数
      days: calculateDays(planForm.startDate, planForm.endDate)
    })
    
    if (success && planStore.currentPlan) {
      generatedItinerary.value = planStore.currentPlan.itinerary
      // 将生成的计划信息填充到表单
      planForm.title = planStore.currentPlan.title
    }
  } catch (error) {
    console.error('生成计划失败:', error)
    alert('生成计划失败: ' + error.message)
  }
}

// 保存计划
const savePlan = async () => {
  // 验证表单
  if (!validateForm()) return
  
  try {
    let success
    if (editingPlan.value) {
      success = await planStore.updatePlan(route.query.id, planForm)
    } else {
      success = await planStore.createPlan(planForm)
    }
    
    if (success) {
      alert(editingPlan.value ? '计划更新成功' : '计划创建成功')
      router.push('/')
    }
  } catch (error) {
    console.error('保存计划失败:', error)
    alert('保存计划失败: ' + error.message)
  }
}

// 验证表单
const validateForm = () => {
  if (!planForm.title) {
    alert('请输入旅行标题')
    return false
  }
  if (!planForm.destination) {
    alert('请输入目的地')
    return false
  }
  if (!planForm.startDate || !planForm.endDate) {
    alert('请选择旅行日期')
    return false
  }
  if (new Date(planForm.endDate) < new Date(planForm.startDate)) {
    alert('结束日期不能早于开始日期')
    return false
  }
  return true
}

// 计算天数
const calculateDays = (start, end) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffTime = Math.abs(endDate - startDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1
}

// 加载现有计划
const loadPlan = async () => {
  if (editingPlan.value) {
    const success = await planStore.loadPlanById(route.query.id)
    if (success && planStore.currentPlan) {
      const plan = planStore.currentPlan
      Object.assign(planForm, {
        title: plan.title,
        destination: plan.destination,
        startDate: plan.startDate,
        endDate: plan.endDate,
        budget: plan.budget || 0,
        travelers: plan.travelers || 1,
        preferences: plan.preferences || [],
        notes: plan.notes || ''
      })
      generatedItinerary.value = plan.itinerary || null
    }
  }
}

// 从URL参数初始化表单（例如从语音识别跳转过来）
onMounted(() => {
  // 加载用户API密钥
  userStore.loadUserData()
  
  // 如果有URL参数，填充表单
  if (Object.keys(route.query).length > 0 && !route.query.id) {
    fillFormFromSpeech(route.query)
  } else if (editingPlan.value) {
    loadPlan()
  }
})
</script>

<style scoped>
.plan-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.plan-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.form-group {
  flex: 1;
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.preferences {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.preferences label {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: #f8f9fa;
  border-radius: 20px;
  cursor: pointer;
  font-weight: normal;
}

.speech-input {
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.speech-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
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

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
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

.itinerary-result {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.itinerary-days {
  margin-top: 20px;
}

.itinerary-day {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.itinerary-day:last-child {
  border-bottom: none;
}

.itinerary-day h3 {
  color: #667eea;
  margin-bottom: 15px;
}

.activities {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.activity {
  padding: 10px 15px;
  background: #f8f9fa;
  border-radius: 5px;
  border-left: 3px solid #667eea;
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