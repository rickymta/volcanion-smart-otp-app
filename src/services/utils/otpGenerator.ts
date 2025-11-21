import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';
import { OtpAccount } from '@/types';

// Base32 alphabet for decoding
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

class OtpGeneratorService {
  // Decode Base32 string to bytes
  private base32Decode(base32: string): number[] {
    const cleanedInput = base32.toUpperCase().replace(/=+$/, '');
    const bytes: number[] = [];
    let bits = 0;
    let value = 0;

    for (let i = 0; i < cleanedInput.length; i++) {
      const char = cleanedInput[i];
      const index = BASE32_ALPHABET.indexOf(char);
      
      if (index === -1) {
        throw new Error(`Invalid Base32 character: ${char}`);
      }

      value = (value << 5) | index;
      bits += 5;

      if (bits >= 8) {
        bytes.push((value >>> (bits - 8)) & 0xff);
        bits -= 8;
      }
    }

    return bytes;
  }

  // Convert number to 8-byte buffer
  private intToBytes(num: number): number[] {
    const bytes = new Array(8);
    for (let i = 7; i >= 0; i--) {
      bytes[i] = num & 0xff;
      num = num >>> 8;
    }
    return bytes;
  }

  // Generate HMAC
  private hmac(algorithm: string, key: number[], message: number[]): CryptoJS.lib.WordArray {
    const keyWords = CryptoJS.lib.WordArray.create(key);
    const messageWords = CryptoJS.lib.WordArray.create(message);

    switch (algorithm.toLowerCase()) {
      case 'sha256':
        return CryptoJS.HmacSHA256(messageWords, keyWords);
      case 'sha512':
        return CryptoJS.HmacSHA512(messageWords, keyWords);
      default: // sha1
        return CryptoJS.HmacSHA1(messageWords, keyWords);
    }
  }

  // Dynamic truncation as per RFC 4226
  private dynamicTruncate(hmacResult: CryptoJS.lib.WordArray): number {
    const bytes = this.wordArrayToBytes(hmacResult);
    const offset = bytes[bytes.length - 1] & 0x0f;
    
    return (
      ((bytes[offset] & 0x7f) << 24) |
      ((bytes[offset + 1] & 0xff) << 16) |
      ((bytes[offset + 2] & 0xff) << 8) |
      (bytes[offset + 3] & 0xff)
    );
  }

  // Convert WordArray to byte array
  private wordArrayToBytes(wordArray: CryptoJS.lib.WordArray): number[] {
    const words = wordArray.words;
    const sigBytes = wordArray.sigBytes;
    const bytes: number[] = [];

    for (let i = 0; i < sigBytes; i++) {
      const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
      bytes.push(byte);
    }

    return bytes;
  }

  // Generate OTP code
  private generateOTP(secret: string, counter: number, digits: number, algorithm: string): string {
    try {
      // Decode Base32 secret
      const keyBytes = this.base32Decode(secret);
      
      // Convert counter to 8-byte array
      const counterBytes = this.intToBytes(counter);
      
      // Generate HMAC
      const hmacResult = this.hmac(algorithm, keyBytes, counterBytes);
      
      // Dynamic truncation
      const truncated = this.dynamicTruncate(hmacResult);
      
      // Generate code
      const code = truncated % Math.pow(10, digits);
      
      // Pad with zeros
      return code.toString().padStart(digits, '0');
    } catch (error) {
      console.error('OTP generation error:', error);
      throw error;
    }
  }

  generateTOTP(account: OtpAccount): string {
    // Calculate time-based counter
    const now = Math.floor(Date.now() / 1000);
    const counter = Math.floor(now / account.period);
    
    return this.generateOTP(
      account.secret,
      counter,
      account.digits,
      account.algorithm
    );
  }

  generateHOTP(account: OtpAccount): string {
    return this.generateOTP(
      account.secret,
      account.counter,
      account.digits,
      account.algorithm
    );
  }

  getTOTPTimeRemaining(period: number = 30): number {
    const now = Math.floor(Date.now() / 1000);
    return period - (now % period);
  }

  verifyTOTP(token: string, secret: string, digits: number = 6, period: number = 30, algorithm: string = 'SHA1'): boolean {
    try {
      const now = Math.floor(Date.now() / 1000);
      const counter = Math.floor(now / period);
      const expected = this.generateOTP(secret, counter, digits, algorithm);
      return token === expected;
    } catch (error) {
      console.error('TOTP verification error:', error);
      return false;
    }
  }

  verifyHOTP(token: string, secret: string, counter: number, digits: number = 6, algorithm: string = 'SHA1'): boolean {
    try {
      const expected = this.generateOTP(secret, counter, digits, algorithm);
      return token === expected;
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
