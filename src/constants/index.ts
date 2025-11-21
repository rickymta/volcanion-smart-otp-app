// API configuration constants
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api', // Update with your backend URL
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'smart_otp_access_token',
  REFRESH_TOKEN: 'smart_otp_refresh_token',
  USER_DATA: 'smart_otp_user_data',
  OTP_ACCOUNTS: 'smart_otp_accounts',
  SETTINGS: 'smart_otp_settings',
  ENCRYPTION_KEY: 'smart_otp_encryption_key',
  LAST_BACKUP: 'smart_otp_last_backup',
};

// Biometric authentication
export const BIOMETRIC_CONFIG = {
  PROMPT_MESSAGE: 'Authenticate to access your OTP codes',
  CANCEL_LABEL: 'Cancel',
  FALLBACK_LABEL: 'Use Passcode',
  DISABLE_DEVICE_FALLBACK: false,
};

// OTP defaults
export const OTP_DEFAULTS = {
  TOTP_PERIOD: 30,
  DIGITS: 6,
  ALGORITHM: 'SHA1' as const,
  COUNTER_START: 0,
};

// Auto-lock timeouts (in seconds)
export const AUTO_LOCK_TIMEOUTS = [
  { label: 'Immediately', value: 0 },
  { label: '30 seconds', value: 30 },
  { label: '1 minute', value: 60 },
  { label: '5 minutes', value: 300 },
  { label: '15 minutes', value: 900 },
  { label: 'Never', value: -1 },
];

// Theme options
export const THEMES = ['light', 'dark', 'auto'] as const;

// Validation patterns
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_PASSWORD_LENGTH: 8,
  OTP_CODE_LENGTH: 6,
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  BIOMETRIC_NOT_AVAILABLE: 'Biometric authentication is not available on this device.',
  BIOMETRIC_NOT_ENROLLED: 'No biometric credentials enrolled on this device.',
  CAMERA_PERMISSION_DENIED: 'Camera permission is required to scan QR codes.',
  INVALID_QR_CODE: 'Invalid QR code format.',
  DUPLICATE_ACCOUNT: 'This account already exists.',
  BACKUP_FAILED: 'Failed to create backup.',
  RESTORE_FAILED: 'Failed to restore from backup.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in',
  LOGOUT_SUCCESS: 'Successfully logged out',
  ACCOUNT_ADDED: 'OTP account added successfully',
  ACCOUNT_DELETED: 'OTP account deleted',
  ACCOUNT_UPDATED: 'OTP account updated',
  BACKUP_SUCCESS: 'Backup created successfully',
  RESTORE_SUCCESS: 'Backup restored successfully',
  SYNC_SUCCESS: 'Accounts synced successfully',
};

// App version
export const APP_VERSION = '1.0.0';
export const BACKUP_VERSION = '1.0';
