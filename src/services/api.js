import axios from 'axios'
import { useUserStore } from '../store/userStore'

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
})

// 请求拦截器，添加认证token
api.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器，处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 未授权，跳转到登录页
      const userStore = useUserStore()
      userStore.logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 认证相关API
export const auth = {
  // TODO: 实现登录API
  login: async (email, password) => {
    // return api.post('/auth/login', { email, password })
    // 模拟响应
    return {
      data: {
        user: { id: 1, email, username: 'user123' },
        token: 'mock_token_123'
      }
    }
  },
  
  // TODO: 实现注册API
  register: async (email, password, username) => {
    // return api.post('/auth/register', { email, password, username })
    return { data: { success: true } }
  },
  
  // TODO: 实现验证tokenAPI
  validateToken: async (token) => {
    // return api.post('/auth/validate', { token })
    return { data: { valid: true } }
  }
}

// 计划相关API
export const plan = {
  // TODO: 实现创建计划API
  createPlan: async (planData) => {
    // return api.post('/plans', planData)
    return { data: { ...planData, id: 1 } }
  },
  
  // TODO: 实现获取计划列表API
  getPlans: async () => {
    // return api.get('/plans')
    return { 
      data: [
        { id: 1, title: '日本旅行', destination: '日本', startDate: '2024-01-01', endDate: '2024-01-05' },
        { id: 2, title: '北京之旅', destination: '北京', startDate: '2024-02-01', endDate: '2024-02-03' }
      ] 
    }
  },
  
  // TODO: 实现获取单个计划API
  getPlan: async (planId) => {
    // return api.get(`/plans/${planId}`)
    return { 
      data: { 
        id: planId, 
        title: '日本旅行', 
        destination: '日本', 
        startDate: '2024-01-01', 
        endDate: '2024-01-05',
        budget: 10000,
        travelers: 2,
        preferences: ['美食', '动漫'],
        itinerary: [
          { day: 1, activities: ['东京塔', '浅草寺'] },
          { day: 2, activities: ['秋叶原', '涩谷'] }
        ]
      } 
    }
  },
  
  // TODO: 实现更新计划API
  updatePlan: async (planId, planData) => {
    // return api.put(`/plans/${planId}`, planData)
    return { data: { ...planData, id: planId } }
  },
  
  // TODO: 实现删除计划API
  deletePlan: async (planId) => {
    // return api.delete(`/plans/${planId}`)
    return { data: { success: true } }
  },
  
  // TODO: 实现AI生成计划API
  generatePlanWithAI: async (preferences) => {
    // return api.post('/plans/generate', preferences)
    return { 
      data: { 
        id: 1, 
        title: `AI生成的${preferences.destination}旅行计划`, 
        destination: preferences.destination,
        startDate: preferences.startDate,
        endDate: preferences.endDate,
        budget: preferences.budget,
        travelers: preferences.travelers,
        preferences: preferences.preferences,
        itinerary: [
          { day: 1, activities: ['推荐景点1', '推荐餐厅1'] },
          { day: 2, activities: ['推荐景点2', '推荐餐厅2'] }
        ],
        generatedByAI: true
      } 
    }
  }
}

// 预算相关API
export const budget = {
  // TODO: 实现设置预算API
  setBudget: async (planId, budgetData) => {
    // return api.post(`/plans/${planId}/budget`, budgetData)
    return { data: { ...budgetData, planId } }
  },
  
  // TODO: 实现获取预算API
  getBudget: async (planId) => {
    // return api.get(`/plans/${planId}/budget`)
    return { data: { total: 10000, accommodation: 3000, transportation: 2000, food: 2000, activities: 2000, other: 1000, planId } }
  },
  
  // TODO: 实现添加开销API
  addExpense: async (planId, expenseData) => {
    // return api.post(`/plans/${planId}/expenses`, expenseData)
    return { data: { ...expenseData, id: Date.now(), planId } }
  },
  
  // TODO: 实现获取开销列表API
  getExpenses: async (planId) => {
    // return api.get(`/plans/${planId}/expenses`)
    return { 
      data: [
        { id: 1, category: '住宿', description: '酒店', amount: 1500, date: '2024-01-01', planId },
        { id: 2, category: '餐饮', description: '晚餐', amount: 300, date: '2024-01-01', planId }
      ] 
    }
  },
  
  // TODO: 实现更新开销API
  updateExpense: async (planId, expenseId, expenseData) => {
    // return api.put(`/plans/${planId}/expenses/${expenseId}`, expenseData)
    return { data: { ...expenseData, id: expenseId, planId } }
  },
  
  // TODO: 实现删除开销API
  deleteExpense: async (planId, expenseId) => {
    // return api.delete(`/plans/${planId}/expenses/${expenseId}`)
    return { data: { success: true } }
  },
  
  // TODO: 实现AI预算分析API
  analyzeBudgetWithAI: async (planId) => {
    // return api.post(`/plans/${planId}/budget/analyze`)
    return { 
      data: {
        suggestions: ['您的餐饮预算可能偏低', '建议增加交通预算', '住宿选择较为合理'],
        optimizedBudget: {
          accommodation: 2500,
          transportation: 2500,
          food: 2500,
          activities: 2000,
          other: 500
        }
      } 
    }
  }
}

// 语音识别服务
export const speech = {
  // TODO: 实现语音识别API（使用科大讯飞或其他服务）
  recognizeSpeech: async (audioData, apiKey) => {
    // 实际实现将调用第三方语音识别服务
    // 这里返回模拟数据
    return { data: { text: '我想去日本，5天，预算1万元，喜欢美食和动漫' } }
  },
  
  // TODO: 实现文本转语音API
  textToSpeech: async (text, apiKey) => {
    // 实际实现将调用第三方TTS服务
    return { data: { audioUrl: 'mock_audio_url' } }
  }
}

// 地图服务
export const map = {
  // TODO: 实现地图搜索API
  searchPlaces: async (keyword, location, apiKey) => {
    // 实际实现将调用高德或百度地图API
    return { 
      data: [
        { id: 1, name: '东京塔', address: '东京都港区芝公园4丁目2-8', lat: 35.6586, lng: 139.7454 },
        { id: 2, name: '浅草寺', address: '东京都台东区浅草2丁目3-1', lat: 35.7147, lng: 139.7967 }
      ] 
    }
  },
  
  // TODO: 实现路线规划API
  getRoute: async (origin, destination, apiKey) => {
    // 实际实现将调用地图API
    return { 
      data: { 
        distance: 5000, // 米
        duration: 30, // 分钟
        polyline: 'mock_polyline_data'
      } 
    }
  }
}

export default api