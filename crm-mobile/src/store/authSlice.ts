import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';
import { tokenStorage } from '../auth/tokenStorage';

export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DISABLED';

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  avatar?: string | null;
  role: UserRole;
  status: UserStatus;
  permissions: string[];
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isHydrating: true,
};

export const bootstrapSession = createAsyncThunk<AuthUser | null>('auth/bootstrap', async () => {
  const [accessToken, refreshToken] = await Promise.all([
    tokenStorage.getAccessToken(),
    tokenStorage.getRefreshToken(),
  ]);
  if (!accessToken && !refreshToken) return null;
  try {
    const response = await axiosClient.get<AuthUser>('/profile');
    return response.data;
  } catch {
    await tokenStorage.clear();
    return null;
  }
});

export const logoutSession = createAsyncThunk('auth/logoutSession', async () => {
  const refreshToken = await tokenStorage.getRefreshToken();
  try {
    if (refreshToken) await axiosClient.post('/auth/logout', { refreshToken });
  } catch {
    // Local logout must still complete when the API is unavailable.
  } finally {
    await tokenStorage.clear();
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: AuthUser }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) Object.assign(state.user, action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = Boolean(action.payload);
        state.isHydrating = false;
      })
      .addCase(bootstrapSession.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isHydrating = false;
      })
      .addCase(logoutSession.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { loginSuccess, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
