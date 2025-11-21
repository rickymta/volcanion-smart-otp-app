# SmartOTP Mobile App

A complete React Native Expo mobile application for TOTP/HOTP two-factor authentication, similar to Microsoft Authenticator and Google Authenticator.

## Features

- **User Authentication**: JWT-based login/logout with auto token refresh
- **OTP Management**: 
  - TOTP (Time-based OTP) and HOTP (Counter-based OTP) support
  - QR code scanning for easy account addition
  - Manual account entry option
  - Offline OTP generation
  - Multiple account support
- **Security**:
  - Biometric authentication (Face ID, Touch ID, Fingerprint)
  - Encrypted storage of OTP secrets
  - Secure JWT token management
  - Auto-lock functionality
- **Backup & Sync**:
  - Encrypted backup and recovery
  - Multi-device sync (server-based)
- **Push OTP**: Approve/deny OTP requests via push notifications

## Tech Stack

- **Framework**: React Native with Expo 50
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation 6
- **API Client**: Axios with JWT interceptors
- **OTP Generation**: otplib
- **Security**: 
  - expo-secure-store
  - expo-local-authentication
  - expo-crypto
- **QR Code**: expo-barcode-scanner
- **UI**: React Native Paper

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── OtpCard.tsx
│   └── LoadingOverlay.tsx
├── constants/           # App constants and config
│   └── index.ts
├── features/            # Redux slices
│   ├── auth/
│   │   └── authSlice.ts
│   ├── otp/
│   │   └── otpSlice.ts
│   └── settings/
│       └── settingsSlice.ts
├── navigation/          # React Navigation setup
│   ├── types.ts
│   ├── AuthNavigator.tsx
│   ├── MainNavigator.tsx
│   ├── HomeTabsNavigator.tsx
│   └── index.tsx
├── screens/             # Screen components
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   └── RegisterScreen.tsx
│   └── main/
│       ├── HomeScreen.tsx
│       ├── AddOtpScreen.tsx
│       ├── OtpDetailScreen.tsx
│       ├── EditOtpScreen.tsx
│       ├── PushApprovalScreen.tsx
│       ├── PushOtpScreen.tsx
│       ├── SettingsScreen.tsx
│       ├── BackupScreen.tsx
│       └── RecoveryScreen.tsx
├── services/
│   ├── api/             # API services
│   │   ├── apiClient.ts
│   │   ├── authService.ts
│   │   ├── otpService.ts
│   │   └── pushOtpService.ts
│   └── utils/           # Utility services
│       ├── biometricService.ts
│       ├── encryptionService.ts
│       ├── otpGenerator.ts
│       ├── secureStorage.ts
│       └── backupService.ts
├── store/               # Redux store setup
│   └── index.ts
└── types/               # TypeScript types
    └── index.ts
```

## Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Configure backend API**:
Edit `src/constants/index.ts` and update the `API_CONFIG.BASE_URL` to point to your backend server.

3. **Run the app**:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Backend API Requirements

The app expects a backend API with the following endpoints:

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new user
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### OTP Accounts
- `GET /api/otp/accounts` - Get all OTP accounts
- `POST /api/otp/accounts` - Add new OTP account
- `PATCH /api/otp/accounts/:id` - Update OTP account
- `DELETE /api/otp/accounts/:id` - Delete OTP account
- `POST /api/otp/verify` - Verify OTP code
- `POST /api/otp/sync` - Sync accounts across devices

### Push OTP
- `GET /api/push-otp/pending` - Get pending push OTP requests
- `POST /api/push-otp/:id/approve` - Approve push OTP request
- `POST /api/push-otp/:id/deny` - Deny push OTP request

## Security Best Practices

1. **OTP Secrets**: All OTP secrets are encrypted using expo-crypto before being stored locally or sent to the server.

2. **Biometric Authentication**: Users can enable biometric authentication to access OTP codes.

3. **Secure Storage**: Sensitive data (tokens, encryption keys) is stored using expo-secure-store.

4. **JWT Management**: Access tokens are automatically refreshed when expired. Axios interceptors handle token attachment and refresh.

5. **Auto-lock**: App can be configured to auto-lock after a specified period of inactivity.

## Usage

### Adding an OTP Account

1. Tap the "+" icon on the Home screen
2. Choose one of two options:
   - **Scan QR Code**: Point camera at QR code
   - **Manual Entry**: Enter issuer, label, and secret key manually

### Viewing OTP Codes

1. Tap on any account card on the Home screen
2. View the current OTP code
3. TOTP codes refresh automatically with a countdown timer
4. HOTP codes can be manually regenerated

### Enabling Biometric Authentication

1. Go to Settings tab
2. Toggle "Biometric Authentication"
3. Next time you open the app, you'll need to authenticate with Face ID/Touch ID/Fingerprint

### Backup & Recovery

1. Go to Settings > Backup & Recovery
2. Create encrypted backup of all accounts
3. Share backup file securely
4. Restore from backup file when needed

## Development

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## License

MIT

## Support

For issues or questions, please refer to the backend API documentation included in the Postman collection files.
