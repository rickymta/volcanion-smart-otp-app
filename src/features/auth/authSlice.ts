import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, AuthTokens, LoginRequest, RegisterRequest } from '@/types';
import { authService } from '@/services/api/authService';
import { secureStorage } from '@/services/utils/secureStorage';
import { STORAGE_KEYS } from '@/constants';

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      
      // Validate response structure
      if (!response || !response.tokens || !response.user) {
        return rejectWithValue('Invalid response from server');
      }

      if (!response.tokens.accessToken || !response.tokens.refreshToken) {
        return rejectWithValue('Missing authentication tokens');
      }
      
      // Store tokens securely
      await secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.tokens.accessToken);
      await secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.tokens.refreshToken);
      await secureStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authService.register(data);
      
      // Validate response structure
      if (!response || !response.tokens || !response.user) {
        return rejectWithValue('Invalid response from server');
      }

      if (!response.tokens.accessToken || !response.tokens.refreshToken) {
        return rejectWithValue('Missing authentication tokens');
      }
      
      // Store tokens securely
      await secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.tokens.accessToken);
      await secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.tokens.refreshToken);
      await secureStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      
      // Clear stored tokens
      await secureStorage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
      await secureStorage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
      await secureStorage.deleteItem(STORAGE_KEYS.USER_DATA);
      
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = await secureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await authService.refreshToken(refreshToken);
      
      // Update stored tokens
      await secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
      await secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const [accessToken, refreshToken, userData] = await Promise.all([
        secureStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        secureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        secureStorage.getItem(STORAGE_KEYS.USER_DATA),
      ]);
      
      if (!accessToken || !refreshToken || !userData) {
        return null;
      }
      
      return {
        user: JSON.parse(userData) as User,
        tokens: { accessToken, refreshToken } as AuthTokens,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.tokens = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.error = null;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = action.payload as string;
    });
    
    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.error = null;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = action.payload as string;
    });
    
    // Logout
    builder.addCase(logout.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.tokens = null;
      state.error = null;
    });
    builder.addCase(logout.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      // Still clear auth state on error
      state.isAuthenticated = false;
      state.user = null;
      state.tokens = null;
    });
    
    // Refresh Token
    builder.addCase(refreshToken.fulfilled, (state, action) => {
      state.tokens = action.payload;
    });
    builder.addCase(refreshToken.rejected, (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.tokens = null;
    });
    
    // Initialize Auth
    builder.addCase(initializeAuth.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(initializeAuth.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
      }
    });
    builder.addCase(initializeAuth.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

export const { clearError, setTokens } = authSlice.actions;
export default authSlice.reducer;
