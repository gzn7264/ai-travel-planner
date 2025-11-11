import { defineStore } from 'pinia'
import { plan } from '../services/api'
import { supabase } from '../services/supabase'

export const usePlanStore = defineStore('plan', {
  state: () => ({
    currentPlan: null,
    planList: [],
    loading: false,
    error: null,
    pendingChanges: [], // 待同步的变更
    syncStatus: 'idle' // idle, syncing, synced, error
  }),
  
  getters: {
    getCurrentPlan: (state) => state.currentPlan,
    getPlanList: (state) => state.planList,
    getSyncStatus: (state) => state.syncStatus,
    hasPendingChanges: (state) => state.pendingChanges.length > 0
  },
  
  actions: {
    // 实现创建新旅行计划逻辑
    async createPlan(planData) {
      this.loading = true
      this.error = null
      try {
        // 获取当前用户ID
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          this.error = '用户未登录'
          return false
        }
        
        // 添加用户ID到计划数据
        const planWithUserId = {
          ...planData,
          user_id: user.id
        }
        
        // 直接调用API创建计划
        const response = await plan.createPlan(planWithUserId)
        
        if (response.data) {
          // 更新本地状态
          this.currentPlan = response.data
          this.planList.push(response.data)
          return true
        }
        
        this.error = '创建计划失败'
        return false
      } catch (error) {
        this.error = error.message || '创建计划失败'
        console.error('Create plan failed:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // 实现加载旅行计划列表逻辑
    async loadPlans() {
      this.loading = true
      this.error = null
      try {
        // 获取当前用户ID
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          this.error = '用户未登录'
          return false
        }
        
        // 从API获取计划列表
        const response = await plan.getPlans()
        
        if (response.data) {
          this.planList = response.data
        }
        
        return true
      } catch (error) {
        this.error = error.message || '获取计划失败'
        console.error('Load plans failed:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // 实现加载单个旅行计划逻辑
    async loadPlanById(planId) {
      this.loading = true
      this.error = null
      try {
        // 获取当前用户ID
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          this.error = '用户未登录'
          return false
        }
        
        // 先尝试从本地查找
        let localPlan = this.planList.find(p => p.id === planId)
        
        if (localPlan) {
          this.currentPlan = localPlan
        } else {
          // 从API获取单个计划
          const response = await plan.getPlan(planId)
          
          if (response.data) {
            this.currentPlan = response.data
            // 保存到本地列表
            this.planList.push(this.currentPlan)
          } else {
            return false
          }
        }
        
        return true
      } catch (error) {
        this.error = error.message || '获取计划失败'
        console.error('Load plan failed:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // 实现更新旅行计划逻辑
    async updatePlan(planId, planData) {
      this.loading = true
      this.error = null
      try {
        // 获取当前用户ID
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          this.error = '用户未登录'
          return false
        }
        
        // 调用API更新计划
        const response = await plan.updatePlan(planId, planData)
        
        if (response.data) {
          // 更新本地状态
          if (this.currentPlan && this.currentPlan.id === planId) {
            this.currentPlan = { ...this.currentPlan, ...response.data }
          }
          
          const index = this.planList.findIndex(p => p.id === planId)
          if (index !== -1) {
            this.planList[index] = { ...this.planList[index], ...response.data }
          }
          
          return true
        }
        
        this.error = '更新计划失败'
        return false
      } catch (error) {
        this.error = error.message || '更新计划失败'
        console.error('Update plan failed:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // 实现删除旅行计划逻辑
    async deletePlan(planId) {
      this.loading = true
      this.error = null
      try {
        // 获取当前用户ID
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          this.error = '用户未登录'
          return false
        }
        
        // 调用API删除计划
        const response = await plan.deletePlan(planId)
        
        if (response.data?.success) {
          // 更新本地状态
          if (this.currentPlan && this.currentPlan.id === planId) {
            this.currentPlan = null
          }
          
          this.planList = this.planList.filter(p => p.id !== planId)
          
          return true
        }
        
        this.error = '删除计划失败'
        return false
      } catch (error) {
        this.error = error.message || '删除计划失败'
        console.error('Delete plan failed:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // 实现AI生成旅行计划逻辑
    async generatePlanWithAI(preferences) {
      this.loading = true
      this.error = null
      try {
        // 获取当前用户ID
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          this.error = '用户未登录'
          return false
        }
        
        // 调用AI API生成计划
        const response = await plan.generatePlanWithAI({
          ...preferences,
          user_id: user.id
        })
        
        if (response.data) {
          // 更新本地状态
          this.currentPlan = response.data
          this.planList.push(response.data)
          return true
        }
        
        this.error = '生成计划失败'
        return false
      } catch (error) {
        this.error = error.message || '生成计划失败'
        console.error('Generate plan with AI failed:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // 云端数据同步方法
    async syncWithCloud() {
      if (this.pendingChanges.length === 0) return true
      
      this.syncStatus = 'syncing'
      try {
        const successfulChanges = []
        
        for (const change of this.pendingChanges) {
          try {
            switch (change.type) {
              case 'create':
                // 尝试创建到云端
                const createResponse = await plan.createPlan(change.data)
                // 更新本地计划的serverId和同步状态
                const localPlanIndex = this.planList.findIndex(p => p.id === change.data.id)
                if (localPlanIndex !== -1) {
                  this.planList[localPlanIndex].serverId = createResponse.data.id
                  this.planList[localPlanIndex].synced = true
                }
                if (this.currentPlan && this.currentPlan.id === change.data.id) {
                  this.currentPlan.serverId = createResponse.data.id
                  this.currentPlan.synced = true
                }
                successfulChanges.push(change)
                break
                
              case 'update':
                // 尝试更新到云端
                const serverId = change.serverId || change.id
                await plan.updatePlan(serverId, change.data)
                // 更新本地同步状态
                const updatePlanIndex = this.planList.findIndex(p => p.id === change.id)
                if (updatePlanIndex !== -1) {
                  this.planList[updatePlanIndex].synced = true
                }
                if (this.currentPlan && this.currentPlan.id === change.id) {
                  this.currentPlan.synced = true
                }
                successfulChanges.push(change)
                break
                
              case 'delete':
                // 尝试删除云端数据
                if (change.serverId) {
                  await plan.deletePlan(change.serverId)
                  successfulChanges.push(change)
                }
                break
            }
          } catch (error) {
            console.warn(`Failed to sync change of type ${change.type}:`, error)
          }
        }
        
        // 从待同步列表中移除成功的变更
        this.pendingChanges = this.pendingChanges.filter(
          change => !successfulChanges.some(sc => sc.id === change.id && sc.type === change.type)
        )
        
        this.syncStatus = this.pendingChanges.length === 0 ? 'synced' : 'partial'
        return true
      } catch (error) {
        console.error('Sync with cloud failed:', error)
        this.syncStatus = 'error'
        return false
      }
    }
  }
})