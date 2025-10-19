import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import userService, { UserProfile, UserSettings } from '../../services/userService';

/**
 * 用户状态接口
 */
export interface UserState {
  profile: UserProfile | null;
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
}

/**
 * 初始状态
 */
const initialState: UserState = {
  profile: null,
  settings: null,
  loading: false,
  error: null,
};

/**
 * 获取用户信息
 */
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await userService.getProfile();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取用户信息失败');
    }
  }
);

/**
 * 获取用户设置
 */
export const fetchUserSettings = createAsyncThunk(
  'user/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const data = await userService.getSettings();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取用户设置失败');
    }
  }
);

/**
 * 用户 Slice
 */
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserData: (state) => {
      state.profile = null;
      state.settings = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 获取用户信息
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取用户设置
    builder
      .addCase(fetchUserSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSettings.fulfilled, (state, action: PayloadAction<UserSettings>) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchUserSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserData } = userSlice.actions;
export default userSlice.reducer;

