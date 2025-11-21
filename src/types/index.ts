// Type definitions for the application
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface OtpAccount {
  id: string;
  userId: string;
  label: string;
  issuer: string;
  secret: string; // Encrypted
  type: 'TOTP' | 'HOTP';
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  digits: 6 | 8;
  period: number; // For TOTP (usually 30 seconds)
  counter: number; // For HOTP
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OtpState {
  accounts: OtpAccount[];
  isLoading: boolean;
  error: string | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastSync: string | null;
}

export interface SettingsState {
  biometricEnabled: boolean;
  backupEnabled: boolean;
  autoLockEnabled: boolean;
  autoLockTimeout: number; // in seconds
  theme: 'light' | 'dark' | 'auto';
  notificationsEnabled: boolean;
  lastBackup: string | null;
}

export interface PushOtpRequest {
  id: string;
  userId: string;
  deviceName: string;
  location?: string;
  timestamp: string;
  expiresAt: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AddOtpRequest {
  label: string;
  issuer: string;
  secret: string;
  type: 'TOTP' | 'HOTP';
  algorithm?: 'SHA1' | 'SHA256' | 'SHA512';
  digits?: 6 | 8;
  period?: number;
}

export interface VerifyOtpRequest {
  accountId: string;
  code: string;
}

export interface BackupData {
  version: string;
  timestamp: string;
  accounts: OtpAccount[];
  settings: SettingsState;
}

export interface RootState {
  auth: AuthState;
  otp: OtpState;
  settings: SettingsState;
}
