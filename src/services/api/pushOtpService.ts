import { apiClient } from './apiClient';
import { PushOtpRequest } from '@/types';

interface PushOtpResponse {
  request: PushOtpRequest;
}

interface ApprovePushOtpResponse {
  success: boolean;
  message: string;
}

export const pushOtpService = {
  async getPendingRequests(): Promise<{ requests: PushOtpRequest[] }> {
    const response = await apiClient.get('/push-otp/pending');
    return response.data;
  },

  async approvePushOtp(requestId: string): Promise<ApprovePushOtpResponse> {
    const response = await apiClient.post(`/push-otp/${requestId}/approve`);
    return response.data;
  },

  async denyPushOtp(requestId: string): Promise<ApprovePushOtpResponse> {
    const response = await apiClient.post(`/push-otp/${requestId}/deny`);
    return response.data;
  },

  async simulatePushOtp(): Promise<PushOtpResponse> {
    const response = await apiClient.post('/push-otp/simulate');
    return response.data;
  },
};
