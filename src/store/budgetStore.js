import { defineStore } from 'pinia'
import { budget } from '../services/api'

export const useBudgetStore = defineStore('budget', {
  state: () => ({
    budgets: {}, // 以planId为key存储各个计划的预算
    expenses: {}, // 以planId为key存储各个计划的开销
    loading: false,
    error: null,
    pendingChanges: [], // 待同步的变更
    syncStatus: 'idle' // idle, syncing, synced, error
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
      const totalExpenses = state.getTotalExpensesByPlanId(planId)
      return budget.total - totalExpenses
    },
    getSyncStatus: (state) => state.syncStatus,
    hasPendingChanges: (state) => state.pendingChanges.length > 0
  },
  
  actions: {
    // 从localStorage加载预算数据
    loadLocalBudgetData() {
      try {
        const savedBudgets = localStorage.getItem('budgets')
        if (savedBudgets) {
          this.budgets = JSON.parse(savedBudgets)
        }
        
        const savedExpenses = localStorage.getItem('expenses')
        if (savedExpenses) {
          this.expenses = JSON.parse(savedExpenses)
        }
      } catch (error) {
        console.error('Failed to load local budget data:', error)
      }
    },
    
    // 保存预算数据到localStorage
    saveLocalBudgetData() {
      try {
        localStorage.setItem('budgets', JSON.stringify(this.budgets))
        localStorage.setItem('expenses', JSON.stringify(this.expenses))
      } catch (error) {
        console.error('Failed to save local budget data:', error)
      }
    },
    
    // 实现设置预算逻辑
    async setBudget(planId, budgetData) {
      this.loading = true
      this.error = null
      try {
        // 更新本地数据
        const updatedBudget = {
          ...budgetData,
          planId,
          updatedAt: new Date().toISOString(),
          synced: false
        }
        
        this.budgets[planId] = updatedBudget
        this.saveLocalBudgetData()
        
        // 添加到待同步列表
        this.pendingChanges.push({
          type: 'setBudget',
          planId,
          data: updatedBudget
        })
        
        // 尝试调用API设置预算
        try {
          await budget.setBudget(planId, budgetData)
          // 更新为已同步状态
          this.budgets[planId].synced = true
          this.saveLocalBudgetData()
        } catch (apiError) {
          console.warn('API call failed, will sync later:', apiError)
        }
        
        return true
      } catch (error) {
        this.error = error.message
        console.error('Set budget failed:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // 实现添加开销逻辑
    async addExpense(planId, expenseData) {
      this.loading = true
      this.error = null
      try {
        // 更新本地数据
        const newExpense = {
          ...expenseData,
          id: Date.now(),
          planId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          synced: false
        }
        
        if (!this.expenses[planId]) {
          this.expenses[planId] = []
        }
        this.expenses[planId].push(newExpense)
        this.saveLocalBudgetData()
        
        // 添加到待同步列表
        this.pendingChanges.push({
          type: 'addExpense',
          planId,
          data: newExpense
        })
        
        // 尝试调用API添加开销
        try {
          const response = await budget.addExpense(planId, expenseData)
          // 更新为已同步状态
          const expenseIndex = this.expenses[planId].findIndex(e => e.id === newExpense.id)
          if (expenseIndex !== -1) {
            this.expenses[planId][expenseIndex].synced = true
            this.expenses[planId][expenseIndex].serverId = response.data.id
          }
          this.saveLocalBudgetData()
        } catch (apiError) {
          console.warn('API call failed, will sync later:', apiError)
        }
        
        return true
      } catch (error) {
        this.error = error.message
        console.error('Add expense failed:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // 实现更新开销逻辑
    async updateExpense(planId, expenseId, expenseData) {
      this.loading = true
      this.error = null
      try {
        // 更新本地数据
        const updatedExpense = {
          ...expenseData,
          id: expenseId,
          planId,
          updatedAt: new Date().toISOString(),
          synced: false
        }
        
        const expenseIndex = this.expenses[planId]?.findIndex(e => e.id === expenseId)
        if (expenseIndex !== -1) {
          this.expenses[planId][expenseIndex] = updatedExpense
          this.saveLocalBudgetData()
          
          // 添加到待同步列表
          this.pendingChanges.push({
            type: 'updateExpense',
            planId,
            expenseId,
            data: updatedExpense
          })
          
          // 尝试调用API更新开销
          try {
            const serverId = updatedExpense.serverId || expenseId
            await budget.updateExpense(planId, serverId, expenseData)
            // 更新为已同步状态
            this.expenses[planId][expenseIndex].synced = true
            this.saveLocalBudgetData()
          } catch (apiError) {
            console.warn('API call failed, will sync later:', apiError)
          }
        }
        
        return true
      } catch (error) {
        this.error = error.message
        console.error('Update expense failed:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // 实现删除开销逻辑
    async deleteExpense(planId, expenseId) {
      this.loading = true
      this.error = null
      try {
        // 查找开销，获取serverId
        const expenseIndex = this.expenses[planId]?.findIndex(e => e.id === expenseId)
        let serverId = null
        
        if (expenseIndex !== -1) {
          serverId = this.expenses[planId][expenseIndex].serverId
          // 本地删除
          this.expenses[planId] = this.expenses[planId].filter(e => e.id !== expenseId)
          this.saveLocalBudgetData()
          
          // 添加到待同步列表
          this.pendingChanges.push({
            type: 'deleteExpense',
            planId,
            expenseId,
            serverId
          })
          
          // 尝试调用API删除开销
          try {
            if (serverId) {
              await budget.deleteExpense(planId, serverId)
            }
          } catch (apiError) {
            console.warn('API call failed, will sync later:', apiError)
          }
        }
        
        return true
      } catch (error) {
        this.error = error.message
        console.error('Delete expense failed:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // 实现加载计划预算和开销逻辑
    async loadBudgetAndExpenses(planId) {
      this.loading = true
      this.error = null
      try {
        // 先加载本地数据
        this.loadLocalBudgetData()
        
        // 如果本地没有该计划的数据，尝试从API加载
        if (!this.budgets[planId] && !this.expenses[planId]) {
          try {
            // 并行加载预算和开销
            const [budgetResponse, expensesResponse] = await Promise.all([
              budget.getBudget(planId),
              budget.getExpenses(planId)
            ])
            
            // 保存到本地
            this.budgets[planId] = {
              ...budgetResponse.data,
              synced: true
            }
            
            this.expenses[planId] = expensesResponse.data.map(expense => ({
              ...expense,
              id: Date.now() + expense.id, // 生成本地ID
              serverId: expense.id,
              synced: true
            }))
            
            this.saveLocalBudgetData()
          } catch (apiError) {
            console.warn('API call failed, using local data:', apiError)
          }
        }
        
        return true
      } catch (error) {
        this.error = error.message
        console.error('Load budget and expenses failed:', error)
        return false
      } finally {
        this.loading = false
      }
    },
    
    // 实现AI预算分析逻辑
    async analyzeBudgetWithAI(planId) {
      this.loading = true
      this.error = null
      try {
        // 调用AI API分析预算
        const response = await budget.analyzeBudgetWithAI(planId)
        return response.data
      } catch (error) {
        this.error = error.message
        console.error('Analyze budget with AI failed:', error)
        return null
      } finally {
        this.loading = false
      }
    },
    
    // 预留云端数据同步方法
    async syncWithCloud() {
      if (this.pendingChanges.length === 0) return true
      
      this.syncStatus = 'syncing'
      try {
        const successfulChanges = []
        
        for (const change of this.pendingChanges) {
          try {
            switch (change.type) {
              case 'setBudget':
                // 尝试同步预算设置
                await budget.setBudget(change.planId, change.data)
                // 更新本地同步状态
                if (this.budgets[change.planId]) {
                  this.budgets[change.planId].synced = true
                }
                successfulChanges.push(change)
                break
                
              case 'addExpense':
                // 尝试同步新增开销
                const addResponse = await budget.addExpense(change.planId, change.data)
                // 更新本地同步状态
                const expenseIndex = this.expenses[change.planId]?.findIndex(e => e.id === change.data.id)
                if (expenseIndex !== -1) {
                  this.expenses[change.planId][expenseIndex].synced = true
                  this.expenses[change.planId][expenseIndex].serverId = addResponse.data.id
                }
                successfulChanges.push(change)
                break
                
              case 'updateExpense':
                // 尝试同步更新开销
                const serverId = change.data.serverId || change.expenseId
                await budget.updateExpense(change.planId, serverId, change.data)
                // 更新本地同步状态
                const updateIndex = this.expenses[change.planId]?.findIndex(e => e.id === change.expenseId)
                if (updateIndex !== -1) {
                  this.expenses[change.planId][updateIndex].synced = true
                }
                successfulChanges.push(change)
                break
                
              case 'deleteExpense':
                // 尝试同步删除开销
                if (change.serverId) {
                  await budget.deleteExpense(change.planId, change.serverId)
                  successfulChanges.push(change)
                }
                break
            }
          } catch (error) {
            console.warn(`Failed to sync ${change.type}:`, error)
          }
        }
        
        // 从待同步列表中移除成功的变更
        this.pendingChanges = this.pendingChanges.filter(
          change => !successfulChanges.some(
            sc => sc.type === change.type && 
                 sc.planId === change.planId && 
                 (sc.expenseId ? sc.expenseId === change.expenseId : true)
          )
        )
        
        // 保存更新后的本地数据
        this.saveLocalBudgetData()
        
        this.syncStatus = this.pendingChanges.length === 0 ? 'synced' : 'partial'
        return true
      } catch (error) {
        console.error('Sync budget with cloud failed:', error)
        this.syncStatus = 'error'
        return false
      }
    },
    
    // 合并本地和云端预算数据
    mergeBudgetData(planId, cloudBudget, cloudExpenses) {
      // 合并预算数据
      if (cloudBudget) {
        const localBudget = this.budgets[planId]
        if (localBudget) {
          // 如果本地有未同步的修改，保留本地版本
          if (!localBudget.synced) {
            // 保留本地版本
          } else {
            // 使用最新的版本
            const cloudUpdated = new Date(cloudBudget.updatedAt || 0).getTime()
            const localUpdated = new Date(localBudget.updatedAt || 0).getTime()
            
            if (cloudUpdated > localUpdated) {
              this.budgets[planId] = {
                ...cloudBudget,
                synced: true
              }
            }
          }
        } else {
          // 云端有但本地没有，添加到本地
          this.budgets[planId] = {
            ...cloudBudget,
            synced: true
          }
        }
      }
      
      // 合并开销数据
      if (cloudExpenses && cloudExpenses.length > 0) {
        // 创建本地开销的映射
        const localExpensesMap = new Map(
          (this.expenses[planId] || []).map(e => [e.serverId || e.id, e])
        )
        const mergedExpenses = []
        const cloudIds = new Set()
        
        // 处理云端开销
        for (const cloudExpense of cloudExpenses) {
          cloudIds.add(cloudExpense.id)
          const localExpense = localExpensesMap.get(cloudExpense.id)
          
          if (localExpense) {
            // 如果本地有未同步的修改，保留本地版本
            if (!localExpense.synced) {
              mergedExpenses.push(localExpense)
            } else {
              // 使用最新的版本
              const cloudUpdated = new Date(cloudExpense.updatedAt || 0).getTime()
              const localUpdated = new Date(localExpense.updatedAt || 0).getTime()
              
              if (cloudUpdated > localUpdated) {
                mergedExpenses.push({
                  ...cloudExpense,
                  id: localExpense.id, // 保留本地ID
                  serverId: cloudExpense.id,
                  synced: true
                })
              } else {
                mergedExpenses.push(localExpense)
              }
            }
          } else {
            // 云端有但本地没有，添加到本地
            mergedExpenses.push({
              ...cloudExpense,
              id: Date.now() + cloudExpense.id, // 生成新的本地ID
              serverId: cloudExpense.id,
              synced: true
            })
          }
        }
        
        // 添加本地有但云端没有的开销
        for (const localExpense of (this.expenses[planId] || [])) {
          if (!cloudIds.has(localExpense.serverId || localExpense.id) && !localExpense.synced) {
            mergedExpenses.push(localExpense)
          }
        }
        
        this.expenses[planId] = mergedExpenses
      }
      
      // 保存更新后的本地数据
      this.saveLocalBudgetData()
    },
    
    // 清理指定计划的预算和开销数据
    clearPlanData(planId) {
      delete this.budgets[planId]
      delete this.expenses[planId]
      // 过滤掉相关的待同步变更
      this.pendingChanges = this.pendingChanges.filter(
        change => change.planId !== planId
      )
      this.saveLocalBudgetData()
    }
  }
})