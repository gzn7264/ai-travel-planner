import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    apiKeys: {
      // TODO: 这里将存储用户配置的API密钥
      xunfei: '',
      map: '',
      llm: ''
    }
  }),
  
  getters: {
    getUserInfo: (state) => state.user,
    getApiKey: (state) => (type) => state.apiKeys[type] || ''
  },
  
  actions: {
    // TODO: 实现用户登录逻辑
    async login(email, password) {
      try {
        // 调用认证API
        // const response = await api.login(email, password)
        // this.user = response.user
        // this.isAuthenticated = true
        // localStorage.setItem('token', response.token)
        return true
      } catch (error) {
        console.error('Login failed:', error)
        return false
      }
    },
    
    // TODO: 实现用户注册逻辑
    async register(email, password, username) {
      try {
        // 调用注册API
        // const response = await api.register(email, password, username)
        return true
      } catch (error) {
        console.error('Register failed:', error)
        return false
      }
    },
    
    // TODO: 实现用户登出逻辑
    logout() {
      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem('token')
    },
    
    // TODO: 实现保存API密钥逻辑
    saveApiKey(type, key) {
      this.apiKeys[type] = key
      localStorage.setItem(`api_key_${type}`, key)
    },
    
    // TODO: 实现加载用户数据逻辑
    loadUserData() {
      // 从localStorage加载API密钥
      Object.keys(this.apiKeys).forEach(type => {
        const savedKey = localStorage.getItem(`api_key_${type}`)
        if (savedKey) {
          this.apiKeys[type] = savedKey
        }
      })
      
      // TODO: 验证token并加载用户信息
      const token = localStorage.getItem('token')
      if (token) {
        // 调用验证token的API
        // this.validateToken(token)
      }
    }
  }
})