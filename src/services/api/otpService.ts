import { apiClient } from './apiClient';
import { OtpAccount, AddOtpRequest, VerifyOtpRequest } from '@/types';

interface GetAccountsResponse {
  accounts: OtpAccount[];
}

interface AddAccountResponse {
  account: OtpAccount;
}

interface UpdateAccountResponse {
  account: OtpAccount;
}

interface VerifyOtpResponse {
  valid: boolean;
  message?: string;
}

interface SyncAccountsResponse {
  accounts: OtpAccount[];
  timestamp: string;
}

export const otpService = {
  async getAccounts(): Promise<GetAccountsResponse> {
    const response = await apiClient.get('/otp/accounts');
    return response.data;
  },

  async addAccount(data: AddOtpRequest): Promise<AddAccountResponse> {
    const response = await apiClient.post('/otp/accounts', data);
    return response.data;
  },

  async updateAccount(
    id: string,
    updates: Partial<OtpAccount>
  ): Promise<UpdateAccountResponse> {
    const response = await apiClient.patch(`/otp/accounts/${id}`, updates);
    return response.data;
  },

  async deleteAccount(id: string): Promise<void> {
    await apiClient.delete(`/otp/accounts/${id}`);
  },

  async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const response = await apiClient.post('/otp/verify', data);
    return response.data;
  },

  async syncAccounts(): Promise<SyncAccountsResponse> {
    const response = await apiClient.post('/otp/sync');
    return response.data;
  },

  async importAccounts(accounts: OtpAccount[]): Promise<GetAccountsResponse> {
    const response = await apiClient.post('/otp/import', { accounts });
    return response.data;
  },

  async exportAccounts(): Promise<{ accounts: OtpAccount[] }> {
    const response = await apiClient.get('/otp/export');
    return response.data;
  },
};
