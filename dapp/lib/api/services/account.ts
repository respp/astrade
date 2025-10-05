import { apiClient, API_CONFIG, buildUrl } from '../client';
import { 
  Balance, 
  Position, 
  AccountSummary, 
  AccountFees,
  LeverageSettings 
} from '../types';

// User creation request type
export interface CreateUserRequest {
  provider: 'apple' | 'google';
  email: string;
  cavos_user_id: string;
  wallet_address: string;
}

// User creation response type
export interface CreateUserResponse {
  user_id: string;
  created_at: string;
}

export class AccountService {
  // Create a new user with complete data from Cavos authentication
  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    const response = await apiClient.post<CreateUserResponse>(
      API_CONFIG.ENDPOINTS.REGISTER_USER, 
      userData
    );
    return response.data;
  }

  // Check if user exists by cavos_user_id
  async getUserByCavosId(cavosUserId: string): Promise<CreateUserResponse | null> {
    try {
      const endpoint = buildUrl(API_CONFIG.ENDPOINTS.GET_USER_BY_CAVOS, { cavos_user_id: cavosUserId });
      console.log('🔍 Looking up user by Cavos ID:', cavosUserId);
      console.log('🔗 Endpoint:', endpoint);
      
      const response = await apiClient.get<CreateUserResponse>(endpoint);
      console.log('📥 Raw response:', response);
      
      // Check if the response has data
      if (response.data && response.data.user_id) {
        console.log('✅ User found:', response.data);
        return {
          user_id: response.data.user_id,
          created_at: response.data.created_at
        };
      }
      
      console.log('⚠️ Response has no user_id:', response.data);
      // If no data, user doesn't exist
      return null;
    } catch (error) {
      console.log('❌ User not found in backend:', error);
      // User doesn't exist
      return null;
    }
  }

  // Set user ID in API client for future requests
  setUserId(userId: string) {
    apiClient.setUserId(userId);
  }

  // Get account balance
  async getBalance(): Promise<Balance[]> {
    const response = await apiClient.get<Balance[]>(API_CONFIG.ENDPOINTS.GET_BALANCE);
    return response.data;
  }

  // Get balance for specific asset
  async getAssetBalance(asset: string): Promise<Balance> {
    const response = await apiClient.get<Balance>(`/account/balance/${asset}`);
    return response.data;
  }
  // Get all open positions
  async getPositions(): Promise<Position[]> {
    const response = await apiClient.get<Position[]>(API_CONFIG.ENDPOINTS.GET_POSITIONS);
    return response.data;
  }

  // Get position for specific symbol
  async getPosition(symbol: string): Promise<Position> {
    const response = await apiClient.get<Position>(`/account/positions/${symbol}`);
    return response.data;
  }

  // Get account summary (overview of balances, PnL, margins)
  async getSummary(): Promise<AccountSummary> {
    const response = await apiClient.get<AccountSummary>(API_CONFIG.ENDPOINTS.GET_ACCOUNT_SUMMARY);
    return response.data;
  }

  // Get account fees structure
  async getFees(): Promise<AccountFees> {
    const response = await apiClient.get<AccountFees>(API_CONFIG.ENDPOINTS.GET_ACCOUNT_FEES);
    return response.data;
  }

  // Update leverage for a specific symbol
  async updateLeverage(symbol: string, leverage: number): Promise<LeverageSettings> {
    const response = await apiClient.patch<LeverageSettings>(API_CONFIG.ENDPOINTS.UPDATE_LEVERAGE, {
      symbol,
      leverage,
    });
    return response.data;
  }

  // Get leverage settings for all symbols
  async getLeverageSettings(): Promise<LeverageSettings[]> {
    const response = await apiClient.get<LeverageSettings[]>(API_CONFIG.ENDPOINTS.GET_LEVERAGE);
    return response.data;
  }

  // Get leverage setting for specific symbol
  async getLeverageSetting(symbol: string): Promise<LeverageSettings> {
    const response = await apiClient.get<LeverageSettings>(`/account/leverage/${symbol}`);
    return response.data;
  }

  // Calculate potential liquidation price
  async calculateLiquidationPrice(
    symbol: string,
    side: 'long' | 'short',
    quantity: number,
    leverage: number
  ): Promise<{ liquidationPrice: number; margin: number }> {
    const response = await apiClient.post<{ liquidationPrice: number; margin: number }>(
      '/account/liquidation-price',
      { symbol, side, quantity, leverage }
    );
    return response.data;
  }

  // Get account PnL history
  async getPnLHistory(
    startTime?: number,
    endTime?: number,
    limit: number = 100
  ): Promise<Array<{ timestamp: number; pnl: number; cumulative: number }>> {
    const params: any = { limit };
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;
    
    const response = await apiClient.get<Array<{ timestamp: number; pnl: number; cumulative: number }>>(
      '/account/pnl-history',
      params
    );
    return response.data;
  }

  // Get margin requirements for a potential trade
  async getMarginRequirement(
    symbol: string,
    side: 'buy' | 'sell',
    quantity: number,
    price?: number
  ): Promise<{ margin: number; freeMargin: number; marginLevel: number }> {
    const params: any = { symbol, side, quantity };
    if (price) params.price = price;
    
    const response = await apiClient.get<{ margin: number; freeMargin: number; marginLevel: number }>(
      '/account/margin-requirement',
      params
    );
    return response.data;
  }

  // Get account trading statistics
  async getTradingStats(
    period: '7d' | '30d' | '90d' | 'all' = '30d'
  ): Promise<{
    totalVolume: number;
    totalTrades: number;
    winRate: number;
    totalPnl: number;
    averageWin: number;
    averageLoss: number;
    largestWin: number;
    largestLoss: number;
    sharpeRatio?: number;
  }> {
    const response = await apiClient.get<{
      totalVolume: number;
      totalTrades: number;
      winRate: number;
      totalPnl: number;
      averageWin: number;
      averageLoss: number;
      largestWin: number;
      largestLoss: number;
      sharpeRatio?: number;
    }>('/account/stats', { period });
    return response.data;
  }

  // Enable/disable position mode (hedge vs one-way)
  async setPositionMode(mode: 'hedge' | 'one-way'): Promise<{ success: boolean }> {
    const response = await apiClient.patch<{ success: boolean }>('/account/position-mode', { mode });
    return response.data;
  }

  // Get current account settings
  async getAccountSettings(): Promise<{
    positionMode: 'hedge' | 'one-way';
    marginMode: 'cross' | 'isolated';
    confirmationRequired: boolean;
    autoDeleveraging: boolean;
  }> {
    const response = await apiClient.get<{
      positionMode: 'hedge' | 'one-way';
      marginMode: 'cross' | 'isolated';
      confirmationRequired: boolean;
      autoDeleveraging: boolean;
    }>('/account/settings');
    return response.data;
  }

  // Update account settings
  async updateAccountSettings(settings: {
    confirmationRequired?: boolean;
    autoDeleveraging?: boolean;
    marginMode?: 'cross' | 'isolated';
  }): Promise<{ success: boolean }> {
    const response = await apiClient.patch<{ success: boolean }>('/account/settings', settings);
    return response.data;
  }
}

export const accountService = new AccountService(); 