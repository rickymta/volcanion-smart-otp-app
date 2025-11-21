import { authenticator, hotp } from 'otplib';
import { OtpAccount } from '@/types';

class OtpGeneratorService {
  generateTOTP(account: OtpAccount): string {
    try {
      // Configure TOTP
      authenticator.options = {
        digits: account.digits,
        step: account.period,
      };

      return authenticator.generate(account.secret);
    } catch (error) {
      console.error('TOTP generation error:', error);
      throw error;
    }
  }

  generateHOTP(account: OtpAccount): string {
    try {
      // Configure HOTP
      hotp.options = {
        digits: account.digits,
      };

      return hotp.generate(account.secret, account.counter);
    } catch (error) {
      console.error('HOTP generation error:', error);
      throw error;
    }
  }

  getTOTPTimeRemaining(period: number = 30): number {
    const now = Math.floor(Date.now() / 1000);
    return period - (now % period);
  }

  verifyTOTP(token: string, secret: string): boolean {
    try {
      return authenticator.verify({ token, secret });
    } catch (error) {
      console.error('TOTP verification error:', error);
      return false;
    }
  }

  verifyHOTP(
    token: string,
    secret: string,
    counter: number
  ): boolean {
    try {
      return hotp.verify({ token, secret, counter });
    } catch (error) {
      console.error('HOTP verification error:', error);
      return false;
    }
  }

  parseOtpAuthUri(uri: string): {
    type: 'TOTP' | 'HOTP';
    label: string;
    issuer: string;
    secret: string;
    algorithm?: 'SHA1' | 'SHA256' | 'SHA512';
    digits?: 6 | 8;
    period?: number;
    counter?: number;
  } | null {
    try {
      const url = new URL(uri);
      
      if (url.protocol !== 'otpauth:') {
        return null;
      }

      const type = url.hostname.toUpperCase() as 'TOTP' | 'HOTP';
      const pathParts = url.pathname.substring(1).split(':');
      const issuer = pathParts.length > 1 ? pathParts[0] : 'Unknown';
      const label = pathParts.length > 1 ? pathParts[1] : pathParts[0];

      const params = new URLSearchParams(url.search);
      const secret = params.get('secret');

      if (!secret) {
        return null;
      }

      const algorithm = (params.get('algorithm') || 'SHA1').toUpperCase() as
        | 'SHA1'
        | 'SHA256'
        | 'SHA512';
      const digits = parseInt(params.get('digits') || '6', 10) as 6 | 8;
      const period = parseInt(params.get('period') || '30', 10);
      const counter = parseInt(params.get('counter') || '0', 10);

      return {
        type,
        label,
        issuer,
        secret,
        algorithm,
        digits,
        period,
        counter,
      };
    } catch (error) {
      console.error('OTP URI parsing error:', error);
      return null;
    }
  }

  generateOtpAuthUri(account: Partial<OtpAccount>): string {
    const {
      type = 'TOTP',
      label = 'Account',
      issuer = 'SmartOTP',
      secret,
      algorithm = 'SHA1',
      digits = 6,
      period = 30,
      counter = 0,
    } = account;

    if (!secret) {
      throw new Error('Secret is required');
    }

    let uri = `otpauth://${type.toLowerCase()}/${encodeURIComponent(
      issuer
    )}:${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(
      issuer
    )}&algorithm=${algorithm}&digits=${digits}`;

    if (type === 'TOTP') {
      uri += `&period=${period}`;
    } else if (type === 'HOTP') {
      uri += `&counter=${counter}`;
    }

    return uri;
  }
}

export const otpGenerator = new OtpGeneratorService();
