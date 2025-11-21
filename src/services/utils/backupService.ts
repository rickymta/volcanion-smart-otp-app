import { BackupData, OtpAccount, SettingsState } from '@/types';
import { encryptionService } from './encryptionService';
import { secureStorage } from './secureStorage';
import { STORAGE_KEYS, BACKUP_VERSION } from '@/constants';
import * as FileSystem from 'expo-file-system';

class BackupService {
  async createBackup(
    accounts: OtpAccount[],
    settings: SettingsState
  ): Promise<string> {
    try {
      const backupData: BackupData = {
        version: BACKUP_VERSION,
        timestamp: new Date().toISOString(),
        accounts,
        settings,
      };

      const jsonData = JSON.stringify(backupData, null, 2);
      const encryptedData = await encryptionService.encrypt(jsonData);

      return encryptedData;
    } catch (error) {
      console.error('Backup creation error:', error);
      throw error;
    }
  }

  async restoreBackup(encryptedData: string): Promise<BackupData> {
    try {
      const decryptedData = await encryptionService.decrypt(encryptedData);
      const backupData: BackupData = JSON.parse(decryptedData);

      // Validate backup version
      if (backupData.version !== BACKUP_VERSION) {
        throw new Error(
          `Incompatible backup version: ${backupData.version}. Expected: ${BACKUP_VERSION}`
        );
      }

      return backupData;
    } catch (error) {
      console.error('Backup restoration error:', error);
      throw error;
    }
  }

  async saveBackupToFile(backupData: string): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `smartotp_backup_${timestamp}.enc`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, backupData);

      // Save last backup timestamp
      await secureStorage.setItem(
        STORAGE_KEYS.LAST_BACKUP,
        new Date().toISOString()
      );

      return fileUri;
    } catch (error) {
      console.error('Save backup to file error:', error);
      throw error;
    }
  }

  async loadBackupFromFile(fileUri: string): Promise<string> {
    try {
      const backupData = await FileSystem.readAsStringAsync(fileUri);
      return backupData;
    } catch (error) {
      console.error('Load backup from file error:', error);
      throw error;
    }
  }

  async shareBackup(_fileUri: string): Promise<void> {
    try {
      // TODO: Install expo-sharing package to enable this feature
      // const isAvailable = await Sharing.isAvailableAsync();
      // if (!isAvailable) {
      //   throw new Error('Sharing is not available on this device');
      // }
      // await Sharing.shareAsync(fileUri, {
      //   mimeType: 'application/octet-stream',
      //   dialogTitle: 'Share SmartOTP Backup',
      // });
      console.log('Share backup feature requires expo-sharing package');
      throw new Error('Share feature not available. Install expo-sharing package.');
    } catch (error) {
      console.error('Share backup error:', error);
      throw error;
    }
  }

  async getLastBackupTimestamp(): Promise<string | null> {
    try {
      return await secureStorage.getItem(STORAGE_KEYS.LAST_BACKUP);
    } catch (error) {
      console.error('Get last backup timestamp error:', error);
      return null;
    }
  }
}

export const backupService = new BackupService();
