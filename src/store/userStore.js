import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'
import { api } from '@/services/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    syncStatus: {
      isSyncing: false,
      lastSynced: null,
      pendingChanges: []
    },
    apiKeys: {
      xunfei: '',
      map: '',
      llm: ''
    }
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    userInitials: (state) => {
      if (!state.user) return ''
      const name = state.user.name || state.user.email
      const parts = name.split(' ')
      return parts.map(part => part[0]).join('').toUpperCase()
    },
    getApiKey: (state) => (type) => state.apiKeys[type] || ''
  },

  actions: {
    // 加载用户数据
    async loadUserData() {
      try {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          this.user = data.session.user
          this.startAutoSync()
          return { success: true, user: this.user }
        }
        return { success: false, error: 'No active session' }
      } catch (error) {
        console.error('Error loading user data:', error)
        return { success: false, error: error.message || 'Failed to load user data' }
      }
    },
    
    // 登录
    async login(credentials) {
      try {
        const { error } = await supabase.auth.signInWithPassword(credentials)
        if (error) {
          console.error('Login error:', error)
          return { success: false, error: error.message || '登录失败，请稍后重试' }
        }
        
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          this.user = data.session.user
          this.startAutoSync()
          return { success: true }
        }
        
        return { success: false, error: '登录失败，请检查用户名和密码' }
      } catch (error) {
        console.error('Login error:', error)
        return { success: false, error: error.message || '登录失败，请稍后重试' }
      }
    },

    // 注册
    async register(userData) {
      try {
        const { error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: { username: userData.username }
          }
        })
        
        if (error) {
          console.error('Register error:', error)
          return { success: false, error: error.message || '注册失败，请稍后重试' }
        }
        
        return { success: true }
      } catch (error) {
        console.error('Register error:', error)
        return { success: false, error: error.message || '注册失败，请稍后重试' }
      }
    },

    // 登出
    async logout() {
      try {
        await supabase.auth.signOut()
        this.user = null
        this.stopAutoSync()
        return { success: true }
      } catch (error) {
        console.error('Logout error:', error)
        // 即使API调用失败，也清除本地状态
        this.user = null
        this.stopAutoSync()
        return { success: true }
      }
    },

    // 验证用户会话
    async validateSession() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error || !data.session) {
          this.user = null
          return false
        }
        this.user = data.session.user
        return true
      } catch (error) {
        console.error('Session validation error:', error)
        return false
      }
    },

    // 实现保存API密钥逻辑
    saveApiKey(type, key) {
      this.apiKeys[type] = key
      // 可以考虑将来将API密钥存储到Supabase中
    },

    // 添加待同步变更
    addPendingChange(change) {
      this.syncStatus.pendingChanges.push(change)
    },

    // 清除待同步变更
    clearPendingChanges() {
      this.syncStatus.pendingChanges = []
    },

    // 开始自动同步
    startAutoSync() {
      this.syncInterval = setInterval(() => {
        this.syncData()
      }, 30 * 60 * 1000) // 每30分钟同步一次
    },

    // 停止自动同步
    stopAutoSync() {
      if (this.syncInterval) {
        clearInterval(this.syncInterval)
        this.syncInterval = null
      }
    },

    // 同步数据到云端
    async syncData() {
      if (this.syncStatus.isSyncing || this.syncStatus.pendingChanges.length === 0 || !this.user) {
        return
      }

      this.syncStatus.isSyncing = true

      try {
        // 处理所有待同步的变更
        for (const change of this.syncStatus.pendingChanges) {
          switch (change.type) {
            case 'create_plan':
              await api.plans.createPlan(change.data)
              break
            case 'update_plan':
              await api.plans.updatePlan(change.planId, change.data)
              break
            case 'delete_plan':
              await api.plans.deletePlan(change.planId)
              break
            // 可以添加其他类型的变更处理
          }
        }
        
        // 清除待同步变更
        this.clearPendingChanges()
        this.syncStatus.lastSynced = new Date().toISOString()
      } catch (error) {
        console.error('Data sync error:', error)
      } finally {
        this.syncStatus.isSyncing = false
      }
    },

    // 初始化用户状态
    async init() {
      try {
        // 尝试从Supabase恢复会话
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          this.user = data.session.user
          this.startAutoSync()
        }
      } catch (error) {
        console.error('Initialization error:', error)
      }
    }
  }
})