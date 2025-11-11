import axios from 'axios';
import { useUserStore } from '../store/userStore';
import { supabase, TABLES } from './supabase';

// 创建axios实例（保留用于第三方API调用）
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 未授权，跳转到登录页
      const userStore = useUserStore();
      userStore.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 语音识别相关API
export const speech = {
  // 科大讯飞语音识别API调用
  recognizeSpeech: async (formData, apiKey) => {
    try {
      // 科大讯飞语音识别API配置
      const appId = import.meta.env.VITE_IFLYTEK_APPID || 'YOUR_APPID';
      const apiSecret = import.meta.env.VITE_IFLYTEK_API_SECRET || 'YOUR_API_SECRET';
      
      // 计算Websocket认证信息（科大讯飞API通常使用WebSocket连接）
      // 这里简化处理，实际项目中需要根据科大讯飞文档计算正确的认证参数
      
      // 发送请求到科大讯飞API（这里是示例，需要根据实际API文档调整）
      const response = await axios.post('https://api.xfyun.cn/v1/private/sluggard', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Appid': appId,
          'Authorization': `Bearer ${apiKey || apiSecret}`
        },
        timeout: 30000
      });
      
      return response;
    } catch (error) {
      console.error('科大讯飞语音识别API调用失败:', error);
      // 降级处理：使用浏览器内置的Web Speech API作为备选
      return await speech.fallbackSpeechRecognition(formData);
    }
  },
  
  // 浏览器内置语音识别API作为备选方案
  fallbackSpeechRecognition: async (formData) => {
    // 这里可以实现基于浏览器的Web Speech API作为备选
    // 但由于浏览器限制，通常需要用户交互才能触发
    console.log('使用备选语音识别方案');
    
    // 返回模拟数据，实际项目中需要实现真实的浏览器语音识别
    return {
      data: {
        text: '这是浏览器语音识别的模拟结果',
        confidence: 0.85
      }
    };
  }
};

// 认证相关API
export const auth = {
  // 使用Supabase实现登录API
  login: async (email, password) => {
    try {
      // 使用Supabase认证
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      // 获取用户完整信息
      const userData = data.user;
      const { data: profileData } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', userData.id)
        .single();
      
      return {
        data: {
          user: {
            id: userData.id,
            email: userData.email,
            username: profileData?.username || email.split('@')[0],
            createdAt: userData.created_at,
            ...profileData
          },
          token: data.session.access_token
        }
      };
    } catch (error) {
      console.error('Supabase login error:', error);
      // 认证失败时不返回模拟数据，直接抛出错误
      throw error;
    }
  },
  
  // 使用Supabase实现注册API
  register: async (email, password, username) => {
    try {
      // 验证输入
      if (!email || !password || !username) {
        throw new Error('Missing required registration fields');
      }
      
      // 使用Supabase注册
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      // 如果注册成功，添加用户到users表
      if (data.user) {
        await supabase.from(TABLES.USERS).insert({
          id: data.user.id,
          email,
          username,
          created_at: new Date().toISOString()
        });
      }
      
      return {
        data: {
          user: data.user,
          message: '注册成功，请查收邮箱验证'
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // 登出
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // 清除本地数据
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { data: { success: true } };
    } catch (error) {
      console.error('Logout error:', error);
      // 降级清除本地数据
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { data: { success: true } };
    }
  }
};

// 导出api对象供其他模块使用
export const api = {
  auth,
  speech,
  plans: {}, // 占位模块，用于planStore
  budget: {} // 占位模块，用于budgetStore
};

// 导出API对象
export default {
  api: apiClient,
  ...api
};

// 单独导出各个模块，供store使用
export const plan = api.plans
export const budget = api.budget