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
  auth
};

// 导出API对象
export default {
  api: apiClient,
  ...api
};