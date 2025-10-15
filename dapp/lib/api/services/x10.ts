import { apiClient } from '../client';

export interface X10Credentials {
  apiKey: string;
  apiSecret: string;
  accountId: string;
}

export interface OnboardX10Response {
  success: boolean;
  credentials?: X10Credentials;
  message?: string;
}

export class X10Service {
  async onboardUser(userId: string): Promise<OnboardX10Response> {
    return apiClient.post<OnboardX10Response>('/api/v1/stark/onboard', {
      user_id: userId,
    });
  }

  async getCredentials(userId: string): Promise<X10Credentials | null> {
    try {
      const response = await apiClient.get<{ credentials: X10Credentials }>(
        `/api/v1/stark/credentials/${userId}`
      );
      return response.credentials;
    } catch (error) {
      console.error('Error getting X10 credentials:', error);
      return null;
    }
  }
}

export const x10Service = new X10Service();
