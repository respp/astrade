import { apiClient, API_CONFIG, buildUrl } from '../client';

export interface MarketStats {
  symbol: string;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

export interface OrderRequest {
  symbol: string;
  type: 'market' | 'limit';
  side: 'buy' | 'sell';
  size: string;
  price?: string;
  reduce_only?: boolean;
  post_only?: boolean;
}

export interface Order {
  id: string;
  symbol: string;
  type: string;
  side: string;
  size: string;
  price?: string;
  status: string;
  filled_size?: string;
  created_at: string;
}

export interface Position {
  symbol: string;
  side: string;
  size: number;
  entryPrice: number;
  unrealizedPnl: number;
  markPrice: number;
}

export interface Balance {
  totalEquity: string;
  availableBalance: string;
  unrealizedPnl: string;
  usedMargin?: string;
  realizedPnl?: string;
}

export class TradingService {
  // Market Data
  async getMarketStats(symbol?: string): Promise<MarketStats[]> {
    const params = symbol ? { symbol } : undefined;
    const response = await apiClient.get<MarketStats[]>(API_CONFIG.ENDPOINTS.GET_MARKET_STATS, params);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch market stats');
    }
    return response.data;
  }

  async getMarkets() {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.GET_MARKETS);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch markets');
    }
    return response.data;
  }

  // Account Management
  async getBalance(): Promise<Balance> {
    const response = await apiClient.get<Balance>(API_CONFIG.ENDPOINTS.GET_BALANCE);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch balance');
    }
    return response.data;
  }

  async getPositions(symbol?: string): Promise<Position[]> {
    const params = symbol ? { symbol } : undefined;
    const response = await apiClient.get<Position[]>(API_CONFIG.ENDPOINTS.GET_POSITIONS, params);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch positions');
    }
    return response.data;
  }

  // Trading Operations
  async placeOrder(orderRequest: OrderRequest): Promise<Order> {
    const response = await apiClient.post<Order>(API_CONFIG.ENDPOINTS.CREATE_ORDER, orderRequest);
    if (!response.success) {
      throw new Error(response.error || 'Failed to place order');
    }
    return response.data;
  }

  async marketBuy(symbol: string, size: number): Promise<Order> {
    return this.placeOrder({
      symbol,
      type: 'market',
      side: 'buy',
      size: size.toString(),
      reduce_only: false,
      post_only: false
    });
  }

  async marketSell(symbol: string, size: number): Promise<Order> {
    return this.placeOrder({
      symbol,
      type: 'market',
      side: 'sell',
      size: size.toString(),
      reduce_only: false,
      post_only: false
    });
  }

  async limitBuy(symbol: string, size: number, price: number): Promise<Order> {
    return this.placeOrder({
      symbol,
      type: 'limit',
      side: 'buy',
      size: size.toString(),
      price: price.toString(),
      reduce_only: false,
      post_only: true
    });
  }

  async limitSell(symbol: string, size: number, price: number): Promise<Order> {
    return this.placeOrder({
      symbol,
      type: 'limit',
      side: 'sell',
      size: size.toString(),
      price: price.toString(),
      reduce_only: false,
      post_only: true
    });
  }

  async getOrders(symbol?: string) {
    const params = symbol ? { symbol } : undefined;
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.GET_ORDERS, params);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch orders');
    }
    return response.data;
  }

  async cancelOrder(orderId: string) {
    const endpoint = buildUrl(API_CONFIG.ENDPOINTS.CANCEL_ORDER, { order_id: orderId });
    const response = await apiClient.delete(endpoint);
    if (!response.success) {
      throw new Error(response.error || 'Failed to cancel order');
    }
    return response.data;
  }

  async getTrades(symbol?: string) {
    const params = symbol ? { symbol } : undefined;
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.GET_TRADES, params);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch trades');
    }
    return response.data;
  }
}

// Export singleton instance
export const tradingService = new TradingService(); 