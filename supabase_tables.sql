-- AI旅行规划应用数据库表结构
-- 此SQL文件包含所有必要表的创建语句以及行级安全策略

-- 1. 创建users表（用户信息表）
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 创建用户只能访问自己数据的策略
CREATE POLICY user_access_policy ON users
  USING (id = auth.uid());

-- 2. 创建travel_plans表（旅行计划表）
CREATE TABLE IF NOT EXISTS travel_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT,
  itinerary JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引优化查询性能
CREATE INDEX idx_travel_plans_user_id ON travel_plans(user_id);
CREATE INDEX idx_travel_plans_destination ON travel_plans(destination);

-- 启用行级安全策略
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;

-- 创建计划相关的行级安全策略
CREATE POLICY plan_select_policy ON travel_plans
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY plan_insert_policy ON travel_plans
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY plan_update_policy ON travel_plans
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY plan_delete_policy ON travel_plans
  FOR DELETE
  USING (user_id = auth.uid());

-- 3. 创建budgets表（预算表）
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES travel_plans(id) ON DELETE CASCADE,
  total_budget DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(3) NOT NULL DEFAULT 'CNY',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引优化查询性能
CREATE INDEX idx_budgets_plan_id ON budgets(plan_id);

-- 启用行级安全策略
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- 创建预算相关的行级安全策略
-- 注意：预算权限依赖于关联的旅行计划权限
CREATE POLICY budget_select_policy ON budgets
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM travel_plans 
    WHERE travel_plans.id = budgets.plan_id 
    AND travel_plans.user_id = auth.uid()
  ));

CREATE POLICY budget_insert_policy ON budgets
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM travel_plans 
    WHERE travel_plans.id = budgets.plan_id 
    AND travel_plans.user_id = auth.uid()
  ));

CREATE POLICY budget_update_policy ON budgets
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM travel_plans 
    WHERE travel_plans.id = budgets.plan_id 
    AND travel_plans.user_id = auth.uid()
  ));

CREATE POLICY budget_delete_policy ON budgets
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM travel_plans 
    WHERE travel_plans.id = budgets.plan_id 
    AND travel_plans.user_id = auth.uid()
  ));

-- 4. 创建expenses表（支出表）
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES travel_plans(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  description TEXT,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引优化查询性能
CREATE INDEX idx_expenses_plan_id ON expenses(plan_id);
CREATE INDEX idx_expenses_category ON expenses(category);

-- 启用行级安全策略
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 创建支出相关的行级安全策略
-- 注意：支出权限依赖于关联的旅行计划权限
CREATE POLICY expense_select_policy ON expenses
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM travel_plans 
    WHERE travel_plans.id = expenses.plan_id 
    AND travel_plans.user_id = auth.uid()
  ));

CREATE POLICY expense_insert_policy ON expenses
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM travel_plans 
    WHERE travel_plans.id = expenses.plan_id 
    AND travel_plans.user_id = auth.uid()
  ));

CREATE POLICY expense_update_policy ON expenses
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM travel_plans 
    WHERE travel_plans.id = expenses.plan_id 
    AND travel_plans.user_id = auth.uid()
  ));

CREATE POLICY expense_delete_policy ON expenses
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM travel_plans 
    WHERE travel_plans.id = expenses.plan_id 
    AND travel_plans.user_id = auth.uid()
  ));

-- 5. 创建user_api_keys表（用户API密钥表）
CREATE TABLE IF NOT EXISTS user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_name VARCHAR(100) NOT NULL,
  api_key VARCHAR(255) NOT NULL,  -- 注意：在实际使用中应该加密存储
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引优化查询性能
CREATE INDEX idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE UNIQUE INDEX idx_user_api_keys_service ON user_api_keys(user_id, service_name);

-- 启用行级安全策略
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- 创建API密钥相关的行级安全策略
CREATE POLICY api_key_select_policy ON user_api_keys
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY api_key_insert_policy ON user_api_keys
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY api_key_update_policy ON user_api_keys
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY api_key_delete_policy ON user_api_keys
  FOR DELETE
  USING (user_id = auth.uid());

-- 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有表创建更新时间戳的触发器
CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_travel_plans_modtime
BEFORE UPDATE ON travel_plans
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_budgets_modtime
BEFORE UPDATE ON budgets
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_expenses_modtime
BEFORE UPDATE ON expenses
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_api_keys_modtime
BEFORE UPDATE ON user_api_keys
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- 初始化数据（可选）
-- INSERT INTO users (username, email) VALUES ('demo', 'demo@example.com');

-- 注意事项：
-- 1. 运行此脚本前，请确保已在Supabase中启用了身份验证
-- 2. 此脚本中的行级安全策略确保用户只能访问自己的数据
-- 3. 对于实际生产环境，建议对user_api_keys表中的api_key字段进行加密存储
-- 4. 运行方式：在Supabase控制台的SQL编辑器中执行此脚本