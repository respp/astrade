import { apiClient, API_CONFIG, buildUrl } from '../client';

export interface StarkOrderRequest {
  amount_of_synthetic: string;
  price: string;
  market_name: string;
  side: 'BUY' | 'SELL';
  post_only?: boolean;
}

export interface StarkOrderResponse {
  external_id: string;
  market_name: string;
  side: string;
  amount: string;
  price: string;
  post_only: boolean;
  status: string;
  order_data: any;
}

export interface StarkOrderCancelRequest {
  order_external_id: string;
}

export interface StarkOrderCancelResponse {
  external_id: string;
  status: string;
  result: any;
}

export interface StarkAccountInfo {
  vault: number;
  public_key: string;
  api_key?: string;
  initialized: boolean;
}

export interface StarkHealthStatus {
  status: 'healthy' | 'unhealthy';
  service: string;
  account_configured?: boolean;
  client_initialized?: boolean;
  error?: string;
}

export class StarkTradingService {
  
  // Account Management
  async getAccountInfo(): Promise<StarkAccountInfo> {
    const response = await apiClient.get<StarkAccountInfo>(API_CONFIG.ENDPOINTS.STARK_GET_ACCOUNT);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch Stark account info');
    }
    return response.data;
  }

  async initializeClient(): Promise<{ status: string; message: string; client_initialized: boolean }> {
    const response = await apiClient.post<{ status: string; message: string; client_initialized: boolean }>(
      API_CONFIG.ENDPOINTS.STARK_INITIALIZE_CLIENT
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to initialize Stark client');
    }
    return response.data;
  }

  async getHealthStatus(): Promise<StarkHealthStatus> {
    const response = await apiClient.get<StarkHealthStatus>(API_CONFIG.ENDPOINTS.STARK_HEALTH);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch Stark health status');
    }
    return response.data;
  }

  // Trading Operations
  async createOrder(orderRequest: StarkOrderRequest): Promise<StarkOrderResponse> {
    try {
      const response = await apiClient.post<StarkOrderResponse>(
        API_CONFIG.ENDPOINTS.STARK_CREATE_ORDER, 
        orderRequest
      );
      if (!response.success) {
        // Preserve the original backend error instead of creating a generic one
        // This allows the error handler to detect specific error codes like 1140
        throw new Error(response.error || 'Failed to create Stark order');
      }
      return response.data;
    } catch (error) {
      // Re-throw the error to preserve the original error structure
      // This ensures that ApiError with code 1140 reaches the error handler
      throw error;
    }
  }

  async cancelOrder(orderExternalId: string): Promise<StarkOrderCancelResponse> {
    const endpoint = buildUrl(API_CONFIG.ENDPOINTS.STARK_CANCEL_ORDER, { order_external_id: orderExternalId });
    const response = await apiClient.delete<StarkOrderCancelResponse>(endpoint);
    if (!response.success) {
      throw new Error(response.error || 'Failed to cancel Stark order');
    }
    return response.data;
  }

  async cancelOrderPost(cancelRequest: StarkOrderCancelRequest): Promise<StarkOrderCancelResponse> {
    const response = await apiClient.post<StarkOrderCancelResponse>(
      API_CONFIG.ENDPOINTS.STARK_CANCEL_ORDER_POST,
      cancelRequest
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to cancel Stark order');
    }
    return response.data;
  }

  // Convenience methods for quick trading
  async marketBuy(amount: string, price: string, market: string = 'BTC-USD'): Promise<StarkOrderResponse> {
    return this.createOrder({
      amount_of_synthetic: amount,
      price: price,
      market_name: market,
      side: 'BUY',
      post_only: false
    });
  }

  async marketSell(amount: string, price: string, market: string = 'BTC-USD'): Promise<StarkOrderResponse> {
    return this.createOrder({
      amount_of_synthetic: amount,
      price: price,
      market_name: market,
      side: 'SELL',
      post_only: false
    });
  }

  async limitBuy(amount: string, price: string, market: string = 'BTC-USD'): Promise<StarkOrderResponse> {
    return this.createOrder({
      amount_of_synthetic: amount,
      price: price,
      market_name: market,
      side: 'BUY',
      post_only: true
    });
  }

  async limitSell(amount: string, price: string, market: string = 'BTC-USD'): Promise<StarkOrderResponse> {
    return this.createOrder({
      amount_of_synthetic: amount,
      price: price,
      market_name: market,
      side: 'SELL',
      post_only: true
    });
  }
}

// Export singleton instance
export const starkTradingService = new StarkTradingService(); 