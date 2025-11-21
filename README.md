# Volcanion Smart OTP App

A secure and user-friendly React Native application for managing One-Time Passwords (OTP) with advanced features including push notifications, biometric authentication, and cloud backup.

## Features

- 🔐 **Secure OTP Management**: Generate and manage time-based (TOTP) and counter-based (HOTP) one-time passwords
- 📱 **Push OTP**: Receive OTP codes via push notifications
- 🔒 **Biometric Authentication**: Secure access with fingerprint or face recognition
- 💾 **Cloud Backup & Recovery**: Backup and restore your OTP configurations
- 🎨 **Modern UI**: Clean and intuitive interface built with React Native
- 🔄 **Redux State Management**: Efficient state management with Redux Toolkit
- 🌐 **API Integration**: Seamless integration with backend services

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **Security**: 
  - Expo Secure Store
  - Expo Local Authentication (Biometrics)
  - Custom encryption service
- **API Client**: Axios

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or physical device with Expo Go)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rickymta/volcanion-smart-otp-app.git
cd volcanion-smart-otp-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your physical device

## Project Structure

```
src/
├── components/       # Reusable UI components
├── constants/        # Application constants
├── features/         # Redux slices (auth, otp, settings)
├── navigation/       # Navigation configuration
├── screens/          # Screen components
├── services/         # API and utility services
├── store/           # Redux store configuration
└── types/           # TypeScript type definitions
```

## Configuration

The app connects to a backend API. Configure the API endpoint in your environment or update the `apiClient.ts` file.

## Security

- All sensitive data is stored using Expo Secure Store
- OTP secrets are encrypted before storage
- Biometric authentication is required for access
- HTTPS communication with backend services

## API Integration

The app includes Postman collections for API testing:
- `SmartOTP.postman_collection.json`
- `SmartOTP.postman_environment.json`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.
