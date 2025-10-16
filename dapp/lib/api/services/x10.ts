import { apiClient, ApiError } from '../client';

// Legacy interfaces for backward compatibility
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

// New interfaces for enhanced X10 functionality
export interface X10OnboardingRequest {
  eth_private_key: string;
  user_id: string;
}

export interface X10OnboardingResponse {
  success: boolean;
  account_data?: {
    l2_vault: string;
    l2_public_key: string;
    l2_private_key: string;
    api_key: string;
    eth_address: string;
    eth_private_key: string;
    claim_id?: string;
    asset_operations?: any;
    environment: string;
  };
  message: string;
  setup_completed: boolean;
  next_steps: string[];
}

export interface X10AccountGenerationRequest {
  user_id: string;
}

export interface X10AccountGenerationResponse {
  success: boolean;
  generated_account?: {
    l2_vault: string;
    l2_public_key: string;
    l2_private_key: string;
    api_key: string;
    eth_address: string;
    eth_private_key: string;
    claim_id?: string;
    asset_operations?: any;
    environment: string;
    generated_from_zero: boolean;
  };
  message: string;
  setup_completed: boolean;
  next_steps: string[];
}

export interface X10StatusResponse {
  success: boolean;
  has_x10_account: boolean;
  x10_credentials?: {
    l2_vault: string;
    eth_address: string;
    environment: string;
    generated_from_zero: boolean;
  };
  message: string;
}

export class X10Service {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/users';
  }

  // Legacy method for backward compatibility
  async onboardUserLegacy(userId: string): Promise<OnboardX10Response> {
    return apiClient.post<OnboardX10Response>('/api/v1/stark/onboard', {
      user_id: userId,
    });
  }

  // Legacy method for backward compatibility
  async getCredentials(userId: string): Promise<X10Credentials | null> {
    try {
      const response = await apiClient.get<{ credentials: X10Credentials }>(
        `/api/v1/stark/credentials/${userId}`
      );
      return response.data.credentials;
    } catch (error) {
      console.error('Error getting X10 credentials:', error);
      return null;
    }
  }

  /**
   * Onboard user to X10 perpetual trading with provided Ethereum private key
   */
  async onboardUser(userId: string, ethPrivateKey: string): Promise<X10OnboardingResponse> {
    try {
      console.log('🔄 Starting X10 onboarding for user:', userId);
      
      const request: X10OnboardingRequest = {
        eth_private_key: ethPrivateKey,
        user_id: userId
      };

      const response = await apiClient.post<X10OnboardingResponse>(
        `${this.baseUrl}/${userId}/x10/onboard`,
        request
      );

      console.log('✅ X10 onboarding completed:', response);
      return response.data;
    } catch (error) {
      console.error('❌ X10 onboarding failed:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error(`X10 onboarding failed: ${error}`);
    }
  }

  /**
   * Generate a completely new X10 account from zero (no private key required)
   */
  async generateNewAccount(userId: string): Promise<X10AccountGenerationResponse> {
    try {
      console.log('🔄 Generating new X10 account from zero for user:', userId);
      
      const request: X10AccountGenerationRequest = {
        user_id: userId
      };

      const url = `${this.baseUrl}/${userId}/x10/generate-account`;
      console.log('🔗 X10 account generation URL:', url);

      const response = await apiClient.post<X10AccountGenerationResponse>(url, request);

      console.log('✅ X10 account generation completed:', response);
      return response.data;
    } catch (error) {
      console.error('❌ X10 account generation failed:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error(`X10 account generation failed: ${error}`);
    }
  }

  /**
   * Check X10 trading status for a user
   */
  async checkX10Status(userId: string): Promise<X10StatusResponse> {
    try {
      console.log('🔄 Checking X10 status for user:', userId);
      
      const url = `${this.baseUrl}/${userId}/x10/status`;
      console.log('🔗 X10 status check URL:', url);
      
      const response = await apiClient.get<X10StatusResponse>(url);

      console.log('✅ X10 status check completed:', response);
      return response.data;
    } catch (error) {
      console.error('❌ X10 status check failed:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error(`X10 status check failed: ${error}`);
    }
  }

  /**
   * Get user's X10 credentials (if they exist)
   */
  async getX10Credentials(userId: string): Promise<X10StatusResponse> {
    try {
      console.log('🔄 Getting X10 credentials for user:', userId);
      
      const response = await apiClient.get<X10StatusResponse>(
        `${this.baseUrl}/${userId}/x10/credentials`
      );

      console.log('✅ X10 credentials retrieved:', response);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get X10 credentials:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error(`Failed to get X10 credentials: ${error}`);
    }
  }
}

// Export singleton instance
export const x10Service = new X10Service();
