import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * 用户信息接口
 */
export interface User {
  id: string;
  username: string;
  email: string;
  nickname?: string;
  avatarUrl?: string;
}

/**
 * 认证状态接口
 */
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

/**
 * 初始状态
 */
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
};

/**
 * 认证 Slice
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 设置登录状态
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; refreshToken: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      
      // 保存到 localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    
    // 更新用户信息
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    
    // 登出
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      
      // 清除 localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
    
    // 设置加载状态
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setCredentials, setUser, logout, setLoading } = authSlice.actions;

export default authSlice.reducer;

