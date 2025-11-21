import * as Crypto from 'expo-crypto';
import * as base64 from 'base-64';
import { secureStorage } from './secureStorage';
import { STORAGE_KEYS } from '@/constants';

class EncryptionService {
  private encryptionKey: string | null = null;

  async initialize(): Promise<void> {
    let key = await secureStorage.getItem(STORAGE_KEYS.ENCRYPTION_KEY);
    
    if (!key) {
      // Generate a new encryption key
      key = await this.generateKey();
      await secureStorage.setItem(STORAGE_KEYS.ENCRYPTION_KEY, key);
    }
    
    this.encryptionKey = key;
  }

  private async generateKey(): Promise<string> {
    // Generate a random 256-bit key
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async encrypt(data: string): Promise<string> {
    if (!this.encryptionKey) {
      await this.initialize();
    }

    try {
      // Simple XOR encryption for demo purposes
      // In production, use a proper encryption library like crypto-js
      const encrypted = this.xorEncrypt(data, this.encryptionKey!);
      return base64.encode(encrypted);
    } catch (error) {
      console.error('Encryption error:', error);
      throw error;
    }
  }

  async decrypt(encryptedData: string): Promise<string> {
    if (!this.encryptionKey) {
      await this.initialize();
    }

    try {
      const decoded = base64.decode(encryptedData);
      return this.xorEncrypt(decoded, this.encryptionKey!);
    } catch (error) {
      console.error('Decryption error:', error);
      throw error;
    }
  }

  private xorEncrypt(data: string, key: string): string {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  }

  async hash(data: string): Promise<string> {
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data
    );
    return digest;
  }
}

export const encryptionService = new EncryptionService();
