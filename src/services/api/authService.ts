import { apiClient } from './apiClient';
import { LoginRequest, RegisterRequest, User, AuthTokens } from '@/types';

interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      // Validate response data
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      // Handle different possible response structures
      const data = response.data;
      
      // Check if data is already in the correct format
      if (data.user && data.tokens) {
        return data;
      }
      
      // Check if tokens are at root level
      if (data.accessToken && data.refreshToken) {
        return {
          user: data.user,
          tokens: {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          },
        };
      }
      
      throw new Error('Invalid response format from server');
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post('/auth/register', data);
      
      // Validate response data
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      const responseData = response.data;
      
      // Check if data is already in the correct format
      if (responseData.user && responseData.tokens) {
        return responseData;
      }
      
      // Check if tokens are at root level
      if (responseData.accessToken && responseData.refreshToken) {
        return {
          user: responseData.user,
          tokens: {
            accessToken: responseData.accessToken,
            refreshToken: responseData.refreshToken,
          },
        };
      }
      
      throw new Error('Invalid response format from server');
    } catch (error: any) {
      console.error('Register error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },
};
