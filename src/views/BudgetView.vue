<template>
  <div class="budget-container">
    <h1>旅行预算管理</h1>
    
    <!-- 选择计划 -->
    <div class="plan-selector">
      <label for="plan-select">选择旅行计划</label>
      <select id="plan-select" v-model="selectedPlanId" @change="loadPlanBudget">
        <option value="">请选择计划</option>
        <option v-for="plan in planStore.planList" :key="plan.id" :value="plan.id">
          {{ plan.title }} - {{ plan.destination }}
        </option>
      </select>
    </div>
    
    <div v-if="selectedPlanId" class="budget-content">
      <!-- 预算设置 -->
      <div class="budget-setting">
        <h2>预算设置</h2>
        <div class="budget-form">
          <div class="form-row">
            <div class="form-group">
              <label>总预算 (元)</label>
              <input 
                type="number" 
                v-model.number="budgetForm.total"
                @change="updateBudget"
              >
            </div>
            <div class="form-group">
              <label>已花费 (元)</label>
              <input type="number" :value="totalExpenses" disabled>
            </div>
            <div class="form-group">
              <label>剩余 (元)</label>
              <input 
                type="number" 
                :value="remainingBudget"
                disabled
                :class="{ 'negative': remainingBudget < 0 }"
              >
            </div>
          </div>
          
          <div class="budget-breakdown">
            <div class="form-group">
              <label>住宿</label>
              <input 
                type="number" 
                v-model.number="budgetForm.accommodation"
                @change="updateBudget"
              >
            </div>
            <div class="form-group">
              <label>交通</label>
              <input 
                type="number" 
                v-model.number="budgetForm.transportation"
                @change="updateBudget"
              >
            </div>
            <div class="form-group">
              <label>餐饮</label>
              <input 
                type="number" 
                v-model.number="budgetForm.food"
                @change="updateBudget"
              >
            </div>
            <div class="form-group">
              <label>活动</label>
              <input 
                type="number" 
                v-model.number="budgetForm.activities"
                @change="updateBudget"
              >
            </div>
            <div class="form-group">
              <label>其他</label>
              <input 
                type="number" 
                v-model.number="budgetForm.other"
                @change="updateBudget"
              >
            </div>
          </div>
          
          <button class="btn-primary" @click="analyzeBudget">
            AI预算分析
          </button>
        </div>
      </div>
      
      <!-- 开销记录 -->
      <div class="expenses-section">
        <h2>开销记录</h2>
        
        <!-- 添加开销 -->
        <div class="add-expense">
          <h3>添加开销</h3>
          <div class="expense-form">
            <div class="form-row">
              <div class="form-group">
                <label>类别</label>
                <select v-model="expenseForm.category">
                  <option value="住宿">住宿</option>
                  <option value="交通">交通</option>
                  <option value="餐饮">餐饮</option>
                  <option value="活动">活动</option>
                  <option value="购物">购物</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div class="form-group">
                <label>金额 (元)</label>
                <input 
                  type="number" 
                  v-model.number="expenseForm.amount"
                  min="0"
                >
              </div>
              <div class="form-group">
                <label>日期</label>
                <input type="date" v-model="expenseForm.date">
              </div>
            </div>
            <div class="form-group">
              <label>描述</label>
              <input 
                type="text" 
                v-model="expenseForm.description"
                placeholder="开销说明"
              >
            </div>
            <div class="form-actions">
              <button class="btn-primary" @click="addExpense">添加</button>
              <button class="btn-secondary" @click="toggleSpeechExpense">
                {{ isRecording ? '停止录音' : '语音添加' }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- 开销列表 -->
        <div class="expense-list">
          <h3>开销明细</h3>
          <div v-if="expenses.length === 0" class="empty-state">
            暂无开销记录
          </div>
          <table v-else class="expense-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>类别</th>
                <th>描述</th>
                <th>金额</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="expense in expenses" :key="expense.id">
                <td>{{ expense.date }}</td>
                <td>{{ expense.category }}</td>
                <td>{{ expense.description }}</td>
                <td>{{ expense.amount }}</td>
                <td>
                  <button class="btn-sm" @click="deleteExpense(expense.id)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- AI分析结果 -->
      <div v-if="budgetAnalysis" class="ai-analysis">
        <h2>AI预算分析</h2>
        <div class="analysis-suggestions">
          <h3>建议</h3>
          <ul>
            <li v-for="(suggestion, index) in budgetAnalysis.suggestions" :key="index">
              {{ suggestion }}
            </li>
          </ul>
        </div>
        <div v-if="budgetAnalysis.optimizedBudget" class="optimized-budget">
          <h3>优化后预算</h3>
          <div class="budget-breakdown">
            <div class="budget-item" v-for="(value, key) in budgetAnalysis.optimizedBudget" :key="key">
              <span>{{ getBudgetCategoryName(key) }}:</span>
              <span>{{ value }}元</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { usePlanStore } from '../store/planStore'
import { useBudgetStore } from '../store/budgetStore'
import { useUserStore } from '../store/userStore'
import { speechRecognitionService } from '../services/speechService'

const planStore = usePlanStore()
const budgetStore = useBudgetStore()
const userStore = useUserStore()

const selectedPlanId = ref('')
const isRecording = ref(false)
const budgetAnalysis = ref(null)

// 预算表单
const budgetForm = reactive({
  total: 0,
  accommodation: 0,
  transportation: 0,
  food: 0,
  activities: 0,
  other: 0
})

// 开销表单
const expenseForm = reactive({
  category: '餐饮',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  description: ''
})

// 计算属性
const expenses = computed(() => {
  return budgetStore.getExpensesByPlanId(selectedPlanId.value) || []
})

const totalExpenses = computed(() => {
  return budgetStore.getTotalExpensesByPlanId(selectedPlanId.value)
})

const remainingBudget = computed(() => {
  return budgetForm.total - totalExpenses.value
})

// 加载计划预算和开销
const loadPlanBudget = async () => {
  if (!selectedPlanId.value) return
  
  await budgetStore.loadBudgetAndExpenses(selectedPlanId.value)
  const budget = budgetStore.getBudgetByPlanId(selectedPlanId.value)
  
  if (budget) {
    Object.assign(budgetForm, budget)
  } else {
    // 如果没有预算信息，初始化表单
    Object.keys(budgetForm).forEach(key => {
      budgetForm[key] = 0
    })
  }
  
  // 清除之前的分析结果
  budgetAnalysis.value = null
}

// 更新预算
const updateBudget = async () => {
  if (!selectedPlanId.value) return
  
  await budgetStore.setBudget(selectedPlanId.value, budgetForm)
}

// 添加开销
const addExpense = async () => {
  if (!selectedPlanId.value || !expenseForm.amount || !expenseForm.description) {
    alert('请填写完整的开销信息')
    return
  }
  
  await budgetStore.addExpense(selectedPlanId.value, { ...expenseForm })
  
  // 重置表单
  expenseForm.amount = 0
  expenseForm.description = ''
}

// 删除开销
const deleteExpense = async (expenseId) => {
  if (confirm('确定要删除这条开销记录吗？')) {
    await budgetStore.deleteExpense(selectedPlanId.value, expenseId)
  }
}

// AI预算分析
const analyzeBudget = async () => {
  if (!selectedPlanId.value) {
    alert('请先选择一个旅行计划')
    return
  }
  
  const analysis = await budgetStore.analyzeBudgetWithAI(selectedPlanId.value)
  if (analysis) {
    budgetAnalysis.value = analysis
  }
}

// 语音添加开销
const toggleSpeechExpense = async () => {
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
      
      // 解析语音中的开销信息
      parseExpenseFromSpeech(text)
    } else {
      await speechRecognitionService.startRecording()
      isRecording.value = true
    }
  } catch (error) {
    console.error('语音识别错误:', error)
    alert('语音识别失败: ' + error.message)
    isRecording.value = false
  }
}

// 从语音解析开销信息
const parseExpenseFromSpeech = (text) => {
  // 简单的解析逻辑
  // 例如："午餐300元", "买了纪念品200元"
  const amountMatch = text.match(/(\d+)元/)
  if (amountMatch) {
    expenseForm.amount = parseInt(amountMatch[1])
  }
  
  // 解析类别
  if (text.includes('餐') || text.includes('饭') || text.includes('食')) {
    expenseForm.category = '餐饮'
  } else if (text.includes('住') || text.includes('酒店') || text.includes('民宿')) {
    expenseForm.category = '住宿'
  } else if (text.includes('车') || text.includes('票') || text.includes('交通')) {
    expenseForm.category = '交通'
  } else if (text.includes('玩') || text.includes('门票') || text.includes('活动')) {
    expenseForm.category = '活动'
  } else if (text.includes('买') || text.includes('购物') || text.includes('纪念品')) {
    expenseForm.category = '购物'
  }
  
  // 将整个文本作为描述
  expenseForm.description = text
}

// 获取预算类别名称
const getBudgetCategoryName = (key) => {
  const categoryMap = {
    accommodation: '住宿',
    transportation: '交通',
    food: '餐饮',
    activities: '活动',
    other: '其他'
  }
  return categoryMap[key] || key
}

// 组件挂载时加载数据
onMounted(async () => {
  userStore.loadUserData()
  await planStore.loadPlans()
})
</script>

<style scoped>
.budget-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.plan-selector {
  margin-bottom: 30px;
}

.plan-selector select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.budget-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
}

.budget-setting,
.expenses-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-row {
  display: flex;
  gap: 15px;
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
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.budget-breakdown {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.btn-primary,
.btn-secondary,
.btn-sm {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
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

.btn-sm {
  background: #dc3545;
  color: white;
  padding: 4px 8px;
  font-size: 12px;
}

.negative {
  color: #dc3545;
  font-weight: bold;
}

.expense-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.expense-table th,
.expense-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.expense-table th {
  background: #f8f9fa;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.ai-analysis {
  grid-column: 1 / -1;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-top: 30px;
}

.analysis-suggestions ul {
  list-style: none;
  padding: 0;
}

.analysis-suggestions li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.optimized-budget .budget-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
}

@media (max-width: 768px) {
  .budget-content {
    grid-template-columns: 1fr;
  }
}
</style>