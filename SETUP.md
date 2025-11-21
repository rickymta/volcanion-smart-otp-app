# SmartOTP Mobile App - Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Expo CLI installed globally: `npm install -g expo-cli`
- For iOS: Mac with Xcode
- For Android: Android Studio with SDK

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React Native and Expo SDK
- Redux Toolkit for state management
- React Navigation for routing
- otplib for OTP generation
- Expo modules for biometric auth, secure storage, camera, etc.

### 2. Configure Backend API

Edit `src/constants/index.ts` and update the `BASE_URL`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://your-backend-api.com/api', // Change this
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};
```

### 3. Platform-Specific Setup

#### iOS Setup

1. Install CocoaPods dependencies:
```bash
cd ios && pod install && cd ..
```

2. Configure Info.plist permissions (already configured in app.json):
   - Camera Usage: For QR code scanning
   - Face ID Usage: For biometric authentication

#### Android Setup

1. Ensure Android SDK is installed
2. Permissions are configured in app.json

### 4. Run the App

```bash
# Development mode
npm start

# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Physical device (scan QR code)
npm start
```

## Backend API Integration

The app expects these API endpoints:

### Authentication Endpoints
```
POST   /api/auth/login         - Login with email/password
POST   /api/auth/register      - Create new account
POST   /api/auth/logout        - Logout
POST   /api/auth/refresh       - Refresh JWT token
GET    /api/auth/me            - Get current user profile
```

### OTP Management Endpoints
```
GET    /api/otp/accounts       - Get all OTP accounts
POST   /api/otp/accounts       - Add new OTP account
PATCH  /api/otp/accounts/:id   - Update OTP account
DELETE /api/otp/accounts/:id   - Delete OTP account
POST   /api/otp/verify         - Verify OTP code
POST   /api/otp/sync           - Sync accounts
```

### Push OTP Endpoints
```
GET    /api/push-otp/pending       - Get pending requests
POST   /api/push-otp/:id/approve   - Approve request
POST   /api/push-otp/:id/deny      - Deny request
```

## Testing

### Test User Flow

1. **Register/Login**: Create account or login
2. **Add OTP Account**: 
   - Use QR code scanner or manual entry
   - Test TOTP and HOTP accounts
3. **View OTP Codes**: Verify codes generate correctly
4. **Enable Biometric Auth**: Test Face ID/Touch ID/Fingerprint
5. **Backup**: Create and restore backups

### Sample QR Code Format

Standard OTP Auth URI format:
```
otpauth://totp/GitHub:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=GitHub&algorithm=SHA1&digits=6&period=30
```

## Security Configuration

### Encryption

The app uses expo-crypto to generate a 256-bit encryption key stored in SecureStore. All OTP secrets are encrypted before storage.

### Biometric Authentication

Configured in `app.json`:
```json
{
  "plugins": [
    [
      "expo-local-authentication",
      {
        "faceIDPermission": "Allow SmartOTP to use Face ID."
      }
    ]
  ]
}
```

### JWT Token Management

- Access tokens stored in SecureStore
- Automatic token refresh on 401 errors
- Axios interceptors handle authentication

## Troubleshooting

### Issue: Module not found errors

**Solution**: Clear cache and reinstall
```bash
rm -rf node_modules
npm install
expo start --clear
```

### Issue: Camera permission denied

**Solution**: Grant permissions in device settings or reinstall app

### Issue: Biometric authentication not working

**Solution**: Ensure device has biometric hardware and credentials enrolled

### Issue: API connection errors

**Solution**: 
1. Check `API_CONFIG.BASE_URL` is correct
2. Ensure backend is running
3. Check network connectivity
4. For iOS simulator, use localhost IP instead of localhost

## Building for Production

### iOS

```bash
expo build:ios
```

### Android

```bash
expo build:android
```

### Using EAS Build (Recommended)

```bash
npm install -g eas-cli
eas login
eas build --platform all
```

## Environment Variables

Create `.env` file for different environments:

```
API_BASE_URL=https://api.production.com
API_TIMEOUT=30000
```

## Code Quality

### Run TypeScript check
```bash
npm run type-check
```

### Run ESLint
```bash
npm run lint
```

## Project Architecture

```
SmartOTP/
├── App.tsx                 # Main app entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── src/
│   ├── components/        # Reusable components
│   ├── constants/         # App constants
│   ├── features/          # Redux slices
│   ├── navigation/        # Navigation setup
│   ├── screens/           # Screen components
│   ├── services/          # API & utility services
│   ├── store/             # Redux store
│   └── types/             # TypeScript types
└── assets/                # Images, icons
```

## Support

For backend API setup, refer to the Postman collection files:
- `SmartOTP.postman_collection.json`
- `SmartOTP.postman_environment.json`

## License

MIT License - See LICENSE file for details
