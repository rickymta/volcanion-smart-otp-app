# SmartOTP Mobile App - Architecture Documentation

## Overview

SmartOTP is a production-ready React Native mobile application for managing TOTP/HOTP two-factor authentication codes. Built with Expo, it follows clean architecture principles and implements best practices for security, state management, and offline-first functionality.

## Architecture Layers

### 1. Presentation Layer (UI)

**Location**: `src/screens/`, `src/components/`, `src/navigation/`

**Responsibilities**:
- Render UI components
- Handle user interactions
- Navigate between screens
- Display data from Redux store

**Key Components**:
- **Screens**: Full-page views (Login, Home, Settings, etc.)
- **Components**: Reusable UI elements (OtpCard, LoadingOverlay)
- **Navigation**: React Navigation stack and tab navigators

**Design Pattern**: Container/Presentational components

### 2. Business Logic Layer

**Location**: `src/features/`

**Responsibilities**:
- Manage application state with Redux Toolkit
- Handle async operations (API calls)
- Implement business rules
- Coordinate between services and UI

**Redux Slices**:

#### authSlice
- User authentication state
- JWT token management
- Login/logout/register actions
- Token refresh logic

#### otpSlice
- OTP accounts management
- TOTP/HOTP code generation
- Account CRUD operations
- Sync status tracking

#### settingsSlice
- App configuration
- User preferences
- Biometric settings
- Theme and security options

**State Management Pattern**: Redux Toolkit with async thunks

### 3. Service Layer

**Location**: `src/services/`

**Responsibilities**:
- External API communication
- Data encryption/decryption
- Device capabilities (biometric, secure storage)
- Business utilities (OTP generation, backup)

**API Services** (`src/services/api/`):

#### apiClient.ts
- Axios instance configuration
- JWT token interceptors
- Automatic token refresh
- Request/response handling

#### authService.ts
- Authentication API calls
- User registration
- Password management

#### otpService.ts
- OTP account API operations
- Account sync
- Import/export functionality

#### pushOtpService.ts
- Push OTP request handling
- Approve/deny operations

**Utility Services** (`src/services/utils/`):

#### encryptionService.ts
- AES encryption for OTP secrets
- Key generation and management
- Data hashing

#### secureStorage.ts
- Wrapper for expo-secure-store
- Encrypted key-value storage
- Token persistence

#### otpGenerator.ts
- TOTP code generation
- HOTP code generation
- OTP URI parsing
- Time-based calculations

#### biometricService.ts
- Face ID / Touch ID integration
- Biometric availability check
- Authentication prompts

#### backupService.ts
- Encrypted backup creation
- Backup restoration
- File sharing

### 4. Data Layer

**Storage Mechanisms**:

1. **SecureStore** (Encrypted):
   - JWT tokens
   - Encryption keys
   - User credentials

2. **Redux State** (Memory):
   - Current user session
   - OTP accounts
   - App settings

3. **Local Cache**:
   - Offline OTP accounts
   - Settings backup

## Data Flow

### Authentication Flow

```
User Input (Email/Password)
    ↓
LoginScreen dispatches login action
    ↓
authSlice async thunk
    ↓
authService.login() API call
    ↓
apiClient with axios
    ↓
Backend API
    ↓
Response: { user, tokens }
    ↓
secureStorage saves tokens
    ↓
Redux state updated
    ↓
Navigation to Main stack
```

### OTP Generation Flow (Offline)

```
User opens OtpDetailScreen
    ↓
Component reads account from Redux
    ↓
otpGenerator.generateTOTP(account)
    ↓
Uses otplib with account.secret
    ↓
Returns 6-digit code
    ↓
Display code with timer
    ↓
Auto-refresh every period (30s)
```

### OTP Account Addition Flow

```
User scans QR code
    ↓
AddOtpScreen receives URI
    ↓
otpGenerator.parseOtpAuthUri(uri)
    ↓
Dispatch addAccount action
    ↓
encryptionService.encrypt(secret)
    ↓
otpService.addAccount() API call
    ↓
Backend saves encrypted account
    ↓
Redux state updated
    ↓
Navigate back to Home
```

## Security Architecture

### 1. Encryption

**OTP Secrets**:
- Encrypted using expo-crypto AES-256
- Encryption key stored in SecureStore
- Never transmitted unencrypted

**Implementation**:
```typescript
// Generate key
const key = await Crypto.getRandomBytesAsync(32);

// Encrypt
const encrypted = encryptionService.encrypt(secret);

// Decrypt
const decrypted = encryptionService.decrypt(encrypted);
```

### 2. Authentication

**JWT Token Management**:
- Access token: Short-lived (15-60 min)
- Refresh token: Long-lived (7-30 days)
- Stored in SecureStore
- Automatic refresh on 401

**Biometric Authentication**:
- Optional layer for viewing OTP codes
- Face ID / Touch ID / Fingerprint
- Device-level security
- Fallback to device passcode

### 3. Network Security

**API Communication**:
- HTTPS only
- JWT bearer tokens
- Request/response interceptors
- Automatic retry on failure

## State Management

### Redux Store Structure

```typescript
{
  auth: {
    user: User | null,
    tokens: AuthTokens | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null
  },
  otp: {
    accounts: OtpAccount[],
    isLoading: boolean,
    error: string | null,
    syncStatus: 'idle' | 'syncing' | 'success' | 'error',
    lastSync: string | null
  },
  settings: {
    biometricEnabled: boolean,
    backupEnabled: boolean,
    autoLockEnabled: boolean,
    autoLockTimeout: number,
    theme: 'light' | 'dark' | 'auto',
    notificationsEnabled: boolean,
    lastBackup: string | null
  }
}
```

### Async Actions Pattern

```typescript
export const fetchAccounts = createAsyncThunk(
  'otp/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await otpService.getAccounts();
      // Process and return data
      return response.accounts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

## Navigation Architecture

### Navigation Structure

```
RootNavigator
├── Auth Stack (if not authenticated)
│   ├── LoginScreen
│   └── RegisterScreen
└── Main Stack (if authenticated)
    ├── HomeTabs
    │   ├── HomeScreen (OTP list)
    │   ├── PushOtpScreen
    │   └── SettingsScreen
    ├── AddOtpScreen (Modal)
    ├── OtpDetailScreen
    ├── EditOtpScreen
    ├── PushApprovalScreen
    ├── BackupScreen
    └── RecoveryScreen
```

### Navigation Guards

- Authentication status determines root navigator
- Biometric lock can prevent access to OTP codes
- Auto-lock redirects to lock screen

## Offline Functionality

### Offline-First Strategy

1. **OTP Generation**: 
   - 100% offline using local secrets
   - No internet required for TOTP/HOTP

2. **Account Management**:
   - Load from local cache on startup
   - Sync with server when online
   - Queue operations when offline

3. **Backup**:
   - Local encrypted backups
   - Export/import via file sharing

## Error Handling

### Error Handling Strategy

1. **API Errors**:
   - Try-catch in async thunks
   - Display user-friendly messages
   - Automatic retry for network errors

2. **Validation Errors**:
   - Client-side validation
   - Server-side validation feedback
   - Form field error states

3. **Runtime Errors**:
   - Error boundaries (future enhancement)
   - Graceful degradation
   - User feedback

## Performance Optimizations

1. **Lazy Loading**: Screens loaded on demand
2. **Memoization**: React.memo for heavy components
3. **Virtualization**: FlatList for large account lists
4. **Debouncing**: Search and filter operations
5. **Image Optimization**: Asset preloading

## Testing Strategy

### Unit Tests
- Redux reducers and actions
- Service layer functions
- Utility functions

### Integration Tests
- API service integration
- Redux thunk flows
- Navigation flows

### E2E Tests
- User authentication flows
- OTP account management
- Biometric authentication

## Future Enhancements

1. **Cloud Sync**: Real-time multi-device sync
2. **Push Notifications**: Real-time push OTP requests
3. **Dark Mode**: Full theme support
4. **Widgets**: iOS/Android home screen widgets
5. **Watch App**: Apple Watch / Wear OS companion
6. **Browser Extension**: Desktop integration

## Dependencies

### Core
- react-native: UI framework
- expo: Development platform
- react-navigation: Navigation
- @reduxjs/toolkit: State management

### Security
- expo-secure-store: Encrypted storage
- expo-local-authentication: Biometric auth
- expo-crypto: Cryptography

### Features
- otplib: OTP generation
- axios: HTTP client
- expo-barcode-scanner: QR scanning

## Build & Deployment

### Development Build
```bash
expo start
```

### Production Build
```bash
# iOS
expo build:ios -t archive

# Android
expo build:android -t app-bundle
```

### App Store Submission
1. Configure app.json metadata
2. Generate app icons and splash screens
3. Build production binaries
4. Submit to App Store / Play Store

## Maintenance

### Code Quality
- TypeScript for type safety
- ESLint for code style
- Prettier for formatting

### Version Control
- Semantic versioning
- Changelog maintenance
- Git flow branching

### Monitoring
- Error tracking (Sentry integration recommended)
- Analytics (Firebase/Amplitude)
- Performance monitoring

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-21
