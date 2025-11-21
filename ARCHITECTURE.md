# Architecture Documentation

## Overview

Volcanion Smart OTP App is built using a modern React Native architecture with TypeScript, following best practices for mobile app development, state management, and security.

## Architecture Patterns

### 1. **Feature-Based Architecture**

The application follows a feature-based folder structure, organizing code by feature rather than by file type. This approach improves:
- Code maintainability
- Team collaboration
- Feature isolation
- Scalability

### 2. **Flux Architecture (Redux)**

State management is implemented using Redux Toolkit, following the Flux pattern:
- **Store**: Single source of truth for application state
- **Actions**: Payloads of information sent to the store
- **Reducers**: Pure functions that specify state changes
- **Selectors**: Functions to derive data from state

## Core Components

### Navigation Layer

**Structure**: `src/navigation/`

- **MainNavigator**: Root navigator managing authentication flow
- **AuthNavigator**: Handles login and registration screens
- **HomeTabsNavigator**: Bottom tab navigation for main app features
- **Types**: TypeScript definitions for navigation parameters

**Technology**: React Navigation v6 with typed navigation

### State Management

**Structure**: `src/features/` and `src/store/`

#### Feature Slices:

1. **Auth Slice** (`authSlice.ts`)
   - User authentication state
   - Login/logout actions
   - Token management
   - User profile data

2. **OTP Slice** (`otpSlice.ts`)
   - OTP entries management
   - TOTP/HOTP generation
   - OTP CRUD operations
   - Sync status tracking

3. **Settings Slice** (`settingsSlice.ts`)
   - User preferences
   - App configuration
   - Theme settings
   - Security options

### Service Layer

**Structure**: `src/services/`

#### API Services (`services/api/`)

1. **API Client** (`apiClient.ts`)
   - Axios configuration
   - Request/response interceptors
   - Authentication token injection
   - Error handling

2. **Auth Service** (`authService.ts`)
   - User registration
   - Login/logout
   - Token refresh
   - Password management

3. **OTP Service** (`otpService.ts`)
   - OTP CRUD operations
   - Server synchronization
   - OTP verification

4. **Push OTP Service** (`pushOtpService.ts`)
   - Push notification handling
   - Push OTP approval
   - Real-time OTP delivery

#### Utility Services (`services/utils/`)

1. **Backup Service** (`backupService.ts`)
   - Cloud backup creation
   - Backup restoration
   - Data encryption for backups

2. **Biometric Service** (`biometricService.ts`)
   - Fingerprint authentication
   - Face ID/Face recognition
   - Biometric availability check

3. **Encryption Service** (`encryptionService.ts`)
   - Data encryption/decryption
   - Secure key generation
   - Cryptographic operations

4. **OTP Generator** (`otpGenerator.ts`)
   - TOTP generation (Time-based)
   - HOTP generation (Counter-based)
   - QR code parsing
   - Secret key validation

5. **Secure Storage** (`secureStorage.ts`)
   - Expo Secure Store wrapper
   - Encrypted local storage
   - Token management

### Screen Layer

**Structure**: `src/screens/`

#### Authentication Screens (`screens/auth/`)
- **LoginScreen**: User authentication
- **RegisterScreen**: New user registration

#### Main Application Screens (`screens/main/`)
- **HomeScreen**: OTP list and quick actions
- **AddOtpScreen**: Add new OTP entry
- **EditOtpScreen**: Modify existing OTP
- **OtpDetailScreen**: View OTP details and generate codes
- **PushOtpScreen**: Manage push OTP settings
- **PushApprovalScreen**: Approve push OTP requests
- **BackupScreen**: Create and manage backups
- **RecoveryScreen**: Restore from backup
- **SettingsScreen**: App settings and preferences

### Component Layer

**Structure**: `src/components/`

Reusable UI components:
- **LoadingOverlay**: Full-screen loading indicator
- **OtpCard**: Display OTP entry with generation controls

## Data Flow

### Authentication Flow

```
User Input → LoginScreen → authService.login()
    ↓
API Request → Backend Authentication
    ↓
Token Received → secureStorage.setToken()
    ↓
authSlice.setUser() → Redux Store Update
    ↓
Navigation to HomeScreen
```

### OTP Generation Flow

```
User Opens OTP → OtpDetailScreen
    ↓
Get OTP Data → otpSlice.selectOtpById()
    ↓
Generate Code → otpGenerator.generateTOTP()
    ↓
Display Code with Timer → UI Update
    ↓
Auto-refresh every 30 seconds
```

### Data Synchronization Flow

```
Local Change → otpSlice.addOtp() or updateOtp()
    ↓
Redux Store Update → UI Update (Optimistic)
    ↓
API Call → otpService.createOtp() or updateOtp()
    ↓
Server Response → Sync confirmation
    ↓
Update local state with server ID
```

## Security Architecture

### Multi-Layer Security

1. **Transport Layer**
   - HTTPS/TLS for all API communications
   - Certificate pinning (production)

2. **Storage Layer**
   - Expo Secure Store for sensitive data
   - Custom encryption for OTP secrets
   - No plain-text storage of secrets

3. **Authentication Layer**
   - JWT token-based authentication
   - Token refresh mechanism
   - Biometric authentication for app access

4. **Application Layer**
   - Input validation
   - XSS prevention
   - Secure random number generation

### Encryption Strategy

- **Algorithm**: AES-256-GCM
- **Key Storage**: Expo Secure Store
- **Data Encrypted**:
  - OTP secrets
  - User credentials (temporary)
  - Backup files

## API Integration

### Request/Response Flow

```
Screen Component → Service Method
    ↓
API Client (with interceptors)
    ↓
Add Auth Header → Send Request
    ↓
Backend API
    ↓
Response Interceptor → Error Handling
    ↓
Return Data → Update Redux Store
    ↓
UI Update
```

### Error Handling

1. **Network Errors**: Retry logic with exponential backoff
2. **Auth Errors**: Auto-logout and redirect to login
3. **Validation Errors**: Display user-friendly messages
4. **Server Errors**: Log and show generic error message

## Performance Optimizations

1. **Code Splitting**: Feature-based lazy loading
2. **Memoization**: React.memo for expensive components
3. **Redux Selectors**: Reselect for computed state
4. **Image Optimization**: Cached and optimized assets
5. **List Virtualization**: FlatList for large OTP lists

## Testing Strategy

- **Unit Tests**: Services and utilities
- **Integration Tests**: Redux slices and API integration
- **E2E Tests**: Critical user flows
- **Security Tests**: Penetration testing and code analysis

## Build and Deployment

### Development Build
```bash
npx expo start
```

### Production Build
```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

## Future Enhancements

- [ ] Wear OS / watchOS support
- [ ] Browser extension companion
- [ ] Multi-device synchronization
- [ ] Offline mode improvements
- [ ] Advanced analytics
- [ ] Custom OTP periods and digits

## Dependencies Management

Key dependencies are managed through:
- **package.json**: NPM package versions
- **expo**: Expo SDK version lock
- Regular security audits via `npm audit`

## Monitoring and Logging

- Error tracking (production)
- Performance monitoring
- User analytics
- Crash reporting

---

For detailed setup instructions, see [README.md](./README.md)
