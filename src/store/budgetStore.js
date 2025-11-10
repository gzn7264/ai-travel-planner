import { defineStore } from 'pinia'

export const useBudgetStore = defineStore('budget', {
  state: () => ({
    budgets: {}, // 以planId为key存储各个计划的预算
    expenses: {}, // 以planId为key存储各个计划的开销
    loading: false,
    error: null
  }),
  
  getters: {
    getBudgetByPlanId: (state) => (planId) => state.budgets[planId] || null,
    getExpensesByPlanId: (state) => (planId) => state.expenses[planId] || [],
    getTotalExpensesByPlanId: (state) => (planId) => {
      const expenses = state.expenses[planId] || []
      return expenses.reduce((total, expense) => total + (expense.amount || 0), 0)
    },
    getRemainingBudget: (state) => (planId) => {
      const budget = state.budgets[planId]
      if (!budget) return null
      const totalExpenses = this.getTotalExpensesByPlanId(planId)
      return budget.total - totalExpenses
    }
  },
  
  actions: {
    // TODO: 实现设置预算逻辑
    async setBudget(planId, budgetData) {
      this.loading = true
      this.error = null
      try {
        // 调用API设置预算
        // const response = await api.setBudget(planId, budgetData)
        // this.budgets[planId] = response.data
        return true
      } catch (error) {
        this.error = error.message
        console.error('Set budget failed:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // TODO: 实现添加开销逻辑
    async addExpense(planId, expenseData) {
      this.loading = true
      this.error = null
      try {
        // 调用API添加开销
        // const response = await api.addExpense(planId, expenseData)
        // if (!this.expenses[planId]) {
        //   this.expenses[planId] = []
        // }
        // this.expenses[planId].push(response.data)
        return true
      } catch (error) {
        this.error = error.message
        console.error('Add expense failed:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // TODO: 实现更新开销逻辑
    async updateExpense(planId, expenseId, expenseData) {
      this.loading = true
      this.error = null
      try {
        // 调用API更新开销
        // const response = await api.updateExpense(planId, expenseId, expenseData)
        // const expenseIndex = this.expenses[planId]?.findIndex(e => e.id === expenseId)
        // if (expenseIndex !== -1) {
        //   this.expenses[planId][expenseIndex] = response.data
        // }
        return true
      } catch (error) {
        this.error = error.message
        console.error('Update expense failed:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // TODO: 实现删除开销逻辑
    async deleteExpense(planId, expenseId) {
      this.loading = true
      this.error = null
      try {
        // 调用API删除开销
        // await api.deleteExpense(planId, expenseId)
        // this.expenses[planId] = this.expenses[planId]?.filter(e => e.id !== expenseId) || []
        return true
      } catch (error) {
        this.error = error.message
        console.error('Delete expense failed:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // TODO: 实现加载计划预算和开销逻辑
    async loadBudgetAndExpenses(planId) {
      this.loading = true
      this.error = null
      try {
        // 并行加载预算和开销
        // const [budgetResponse, expensesResponse] = await Promise.all([
        //   api.getBudget(planId),
        //   api.getExpenses(planId)
        // ])
        // this.budgets[planId] = budgetResponse.data
        // this.expenses[planId] = expensesResponse.data
        return true
      } catch (error) {
        this.error = error.message
        console.error('Load budget and expenses failed:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // TODO: 实现AI预算分析逻辑
    async analyzeBudgetWithAI(planId) {
      this.loading = true
      this.error = null
      try {
        // 调用AI API分析预算
        // const response = await api.analyzeBudgetWithAI(planId)
        // return response.data
        return null
      } catch (error) {
        this.error = error.message
        console.error('Analyze budget with AI failed:', error)
        return null
      } finally {
        this.loading = false
      }
    }
  }
})