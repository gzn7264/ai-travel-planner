import { createClient } from '@supabase/supabase-js'

// Supabase配置
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// 创建Supabase客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 导出Supabase客户端实例
export { supabase }

// 定义Supabase表名常量
export const TABLES = {
  USERS: 'users',
  PLANS: 'travel_plans',
  BUDGETS: 'budgets',
  EXPENSES: 'expenses',
  API_KEYS: 'user_api_keys'
}