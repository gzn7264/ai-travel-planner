# AI 旅行规划师 (AI Travel Planner)

## 项目简介

AI 旅行规划师是一个基于Vue 3的智能旅行规划Web应用，旨在通过人工智能简化旅行规划过程。用户可以通过语音或文字输入旅行需求，AI将自动生成详细的旅行路线和建议，并提供实时旅行辅助功能。

## 核心功能

### 1. 智能行程规划
- 语音和文字输入支持（语音功能为必须）
- 自动生成个性化旅行路线，包括交通、住宿、景点、餐厅等详细信息
- 支持自定义旅行目的地、日期、预算、人数和偏好

### 2. 费用预算与管理
- AI预算分析和优化建议
- 实时开销记录（支持语音输入）
- 可视化预算追踪

### 3. 用户管理与数据存储
- 注册登录系统，支持保存和管理多份旅行计划
- 云端行程同步，多设备查看和修改
- 安全的API密钥管理

## 技术栈

### 前端
- **框架**: Vue 3
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP请求**: Axios
- **构建工具**: Vite

### 后端服务
- **语音识别**: 科大讯飞API（已集成）
- **地图服务**: 计划集成高德/百度地图API
- **AI模型**: 计划集成大语言模型API
- **数据存储**: Supabase（已集成用户认证和数据存储）

## 项目结构

```
ai-travel-planner/
├── src/
│   ├── assets/           # 静态资源
│   ├── components/       # 通用组件
│   ├── router/           # 路由配置
│   ├── services/         # API服务和工具函数
│   │   ├── api.js        # API接口封装
│   │   └── speechService.js # 语音识别服务
│   ├── store/            # Pinia状态管理
│   │   ├── userStore.js  # 用户状态
│   │   ├── planStore.js  # 旅行计划状态
│   │   └── budgetStore.js # 预算管理状态
│   ├── views/            # 页面组件
│   │   ├── HomeView.vue  # 首页
│   │   ├── PlanView.vue  # 行程规划页
│   │   ├── BudgetView.vue # 预算管理页
│   │   ├── SettingsView.vue # 设置页
│   │   ├── LoginView.vue # 登录页
│   │   └── RegisterView.vue # 注册页
│   ├── App.vue           # 根组件
│   ├── main.js           # 入口文件
│   └── style.css         # 全局样式
├── public/               # 公共资源
├── .gitignore            # Git忽略配置
├── index.html            # HTML入口
├── package.json          # 项目依赖
├── vite.config.js        # Vite配置
└── README.md             # 项目说明
```

## 安装与运行

### 前置要求
- Node.js 16+
- npm 或 yarn

### 安装步骤

1. 克隆项目
```bash
git clone <repository-url>
cd ai-travel-planner
```

2. 安装依赖
```bash
npm install
# 或
yarn install
```

3. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

4. 构建生产版本
```bash
npm run build
# 或
yarn build
```

## 关键功能实现说明

### 语音识别功能
- 使用科大讯飞API进行语音识别
- 支持实时录音和转文字
- 语音指令解析，自动填充表单

### AI行程规划
- 通过大语言模型API生成个性化行程
- 支持多种旅行偏好参数
- 可视化行程展示

### 预算管理
- 预算分配和跟踪
- 实时开销记录
- AI预算分析和优化建议

## API密钥配置

### 环境变量配置
项目使用环境变量管理敏感配置，配置方法如下：

1. 复制示例配置文件
```bash
cp .env.example .env
```

2. 编辑.env文件，填入实际的API密钥
```
# 科大讯飞语音识别API配置
VITE_IFLYTEK_APPID=your_app_id_here
VITE_IFLYTEK_API_SECRET=your_api_secret_here

# API基础URL
VITE_API_BASE_URL=http://localhost:3000/api

# Supabase配置
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 运行时配置
也可以在应用的语音测试页面直接配置科大讯飞API密钥，这些配置会保存在浏览器的localStorage中。

## TODO列表

### 前端功能
- [x] 完善语音识别功能，对接科大讯飞API（已实现并提供测试页面）
- [ ] 实现地图展示和导航功能
- [ ] 优化移动端响应式设计
- [ ] 添加行程分享功能
- [ ] 实现离线访问支持

### 后端服务
- [x] 开发用户认证和授权系统（已使用Supabase实现）
- [x] 实现行程数据的云存储（已使用Supabase实现基础存储）
- [ ] 对接大语言模型API进行行程生成
- [ ] 开发数据分析和统计功能

### 性能优化
- [ ] 优化页面加载速度
- [ ] 实现数据缓存策略
- [ ] 优化语音识别体验

## 如何验证语音识别功能

### 使用语音测试页面

1. 确保应用已启动并登录
2. 在导航栏点击"语音测试"链接
3. 在测试页面中配置科大讯飞API凭证（或使用默认备选方案）
4. 点击"开始录音"按钮，系统会请求麦克风权限
5. 对着麦克风说出旅行需求（例如："我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"）
6. 点击"停止录音并识别"按钮
7. 查看识别结果和解析的指令内容

### 功能验证要点

1. **麦克风权限**: 验证应用是否正确请求和处理麦克风权限
2. **录音功能**: 确认录音状态指示器正常工作
3. **语音识别**: 检查识别结果是否准确
4. **指令解析**: 验证系统能否正确解析目的地、天数、预算等关键信息
5. **错误处理**: 测试无API密钥或网络异常情况下的降级处理

### 备选方案

如果没有科大讯飞API密钥，可以使用浏览器内置的Web Speech API作为备选方案，系统会自动切换。

## 注意事项

1. 本项目已集成Supabase进行用户认证和数据存储
2. 语音识别功能需要用户授予麦克风权限
3. 地图功能正在开发中，尚未集成
4. 语音识别的准确性依赖于网络环境和API配置
5. 使用科大讯飞API需要申请API密钥并配置正确的参数

## License

[MIT](LICENSE)
