import * as LocalAuthentication from 'expo-local-authentication';
import { BIOMETRIC_CONFIG, ERROR_MESSAGES } from '@/constants';

class BiometricService {
  async isAvailable(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return compatible && enrolled;
    } catch (error) {
      console.error('Biometric availability check error:', error);
      return false;
    }
  }

  async getSupportedTypes(): Promise<string[]> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      return types.map((type) => {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            return 'Fingerprint';
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            return 'Face ID';
          case LocalAuthentication.AuthenticationType.IRIS:
            return 'Iris';
          default:
            return 'Unknown';
        }
      });
    } catch (error) {
      console.error('Get supported biometric types error:', error);
      return [];
    }
  }

  async authenticate(
    promptMessage?: string,
    cancelLabel?: string,
    disableDeviceFallback?: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const isAvailable = await this.isAvailable();

      if (!isAvailable) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        return {
          success: false,
          error: enrolled
            ? ERROR_MESSAGES.BIOMETRIC_NOT_AVAILABLE
            : ERROR_MESSAGES.BIOMETRIC_NOT_ENROLLED,
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || BIOMETRIC_CONFIG.PROMPT_MESSAGE,
        cancelLabel: cancelLabel || BIOMETRIC_CONFIG.CANCEL_LABEL,
        fallbackLabel: BIOMETRIC_CONFIG.FALLBACK_LABEL,
        disableDeviceFallback:
          disableDeviceFallback ?? BIOMETRIC_CONFIG.DISABLE_DEVICE_FALLBACK,
      });

      if (result.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || 'Authentication failed',
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }
}

export const biometricService = new BiometricService();
