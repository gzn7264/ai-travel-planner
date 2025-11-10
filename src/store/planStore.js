import { defineStore } from 'pinia'

export const usePlanStore = defineStore('plan', {
  state: () => ({
    currentPlan: null,
    planList: [],
    loading: false,
    error: null
  }),
  
  getters: {
    getCurrentPlan: (state) => state.currentPlan,
    getPlanList: (state) => state.planList
  },
  
  actions: {
    // TODO: 实现创建新旅行计划逻辑
    async createPlan(planData) {
      this.loading = true
      this.error = null
      try {
        // 调用API创建计划
        // const response = await api.createPlan(planData)
        // this.currentPlan = response.data
        // this.planList.push(response.data)
        return true
      } catch (error) {
        this.error = error.message
        console.error('Create plan failed:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // TODO: 实现加载旅行计划列表逻辑
    async loadPlans() {
      this.loading = true
      this.error = null
      try {
        // 调用API获取计划列表
        // const response = await api.getPlans()
        // this.planList = response.data
        return true
      } catch (error) {
        this.error = error.message
        console.error('Load plans failed:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // TODO: 实现加载单个旅行计划逻辑
    async loadPlanById(planId) {
      this.loading = true
      this.error = null
      try {
        // 调用API获取单个计划
        // const response = await api.getPlan(planId)
        // this.currentPlan = response.data
        return true
      } catch (error) {
        this.error = error.message
        console.error('Load plan failed:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // TODO: 实现更新旅行计划逻辑
    async updatePlan(planId, planData) {
      this.loading = true
      this.error = null
      try {
        // 调用API更新计划
        // const response = await api.updatePlan(planId, planData)
        // 更新当前计划和列表中的计划
        // if (this.currentPlan && this.currentPlan.id === planId) {
        //   this.currentPlan = response.data
        // }
        // const index = this.planList.findIndex(p => p.id === planId)
        // if (index !== -1) {
        //   this.planList[index] = response.data
        // }
        return true
      } catch (error) {
        this.error = error.message
        console.error('Update plan failed:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // TODO: 实现删除旅行计划逻辑
    async deletePlan(planId) {
      this.loading = true
      this.error = null
      try {
        // 调用API删除计划
        // await api.deletePlan(planId)
        // 如果删除的是当前计划，清空当前计划
        // if (this.currentPlan && this.currentPlan.id === planId) {
        //   this.currentPlan = null
        // }
        // 从列表中移除
        // this.planList = this.planList.filter(p => p.id !== planId)
        return true
      } catch (error) {
        this.error = error.message
        console.error('Delete plan failed:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // TODO: 实现AI生成旅行计划逻辑
    async generatePlanWithAI(preferences) {
      this.loading = true
      this.error = null
      try {
        // 调用AI API生成计划
        // const response = await api.generatePlanWithAI(preferences)
        // this.currentPlan = response.data
        return true
      } catch (error) {
        this.error = error.message
        console.error('Generate plan with AI failed:', error)
        return false
      } finally {
        this.loading = false
      }
    }
  }
})