import { apiClient, API_CONFIG, buildUrl } from '../client';
import { 
  Order, 
  PlaceOrderRequest, 
  TWAPOrderRequest,
  Trade,
  PaginatedResponse 
} from '../types';

export class OrdersService {
  // Place a new order
  async placeOrder(orderRequest: PlaceOrderRequest): Promise<Order> {
    const response = await apiClient.post<Order>(API_CONFIG.ENDPOINTS.CREATE_ORDER, orderRequest);
    return response.data;
  }

  // Quick market buy
  async marketBuy(symbol: string, quantity: number, reduceOnly: boolean = false): Promise<Order> {
    const orderRequest: PlaceOrderRequest = {
      symbol,
      side: 'buy',
      type: 'market',
      quantity,
      reduceOnly,
    };
    return this.placeOrder(orderRequest);
  }

  // Quick market sell
  async marketSell(symbol: string, quantity: number, reduceOnly: boolean = false): Promise<Order> {
    const orderRequest: PlaceOrderRequest = {
      symbol,
      side: 'sell',
      type: 'market',
      quantity,
      reduceOnly,
    };
    return this.placeOrder(orderRequest);
  }

  // Quick limit buy
  async limitBuy(
    symbol: string, 
    quantity: number, 
    price: number, 
    timeInForce: 'GTC' | 'IOC' | 'FOK' = 'GTC'
  ): Promise<Order> {
    const orderRequest: PlaceOrderRequest = {
      symbol,
      side: 'buy',
      type: 'limit',
      quantity,
      price,
      timeInForce,
    };
    return this.placeOrder(orderRequest);
  }

  // Quick limit sell
  async limitSell(
    symbol: string, 
    quantity: number, 
    price: number, 
    timeInForce: 'GTC' | 'IOC' | 'FOK' = 'GTC'
  ): Promise<Order> {
    const orderRequest: PlaceOrderRequest = {
      symbol,
      side: 'sell',
      type: 'limit',
      quantity,
      price,
      timeInForce,
    };
    return this.placeOrder(orderRequest);
  }

  // Cancel a specific order by ID
  async cancelOrder(orderId: string): Promise<Order> {
    const endpoint = buildUrl(API_CONFIG.ENDPOINTS.CANCEL_ORDER, { order_id: orderId });
    const response = await apiClient.delete<Order>(endpoint);
    return response.data;
  }

  // Cancel all orders (optionally filter by symbol)
  async cancelAllOrders(symbol?: string): Promise<Order[]> {
    const endpoint = symbol ? `${API_CONFIG.ENDPOINTS.GET_ORDERS}?symbol=${symbol}` : API_CONFIG.ENDPOINTS.GET_ORDERS;
    const response = await apiClient.delete<Order[]>(endpoint);
    return response.data;
  }

  // Get order history
  async getOrderHistory(
    symbol?: string, 
    status?: string,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<Order>> {
    const params: any = { page, limit };
    if (symbol) params.symbol = symbol;
    if (status) params.status = status;
    
    const response = await apiClient.get<PaginatedResponse<Order>>(API_CONFIG.ENDPOINTS.GET_ORDER_HISTORY, params);
    return response.data;
  }

  // Get active (open) orders
  async getActiveOrders(symbol?: string): Promise<Order[]> {
    const params = symbol ? { symbol } : {};
    const response = await apiClient.get<Order[]>(API_CONFIG.ENDPOINTS.GET_ACTIVE_ORDERS, params);
    return response.data;
  }

  // Get trade history
  async getTradeHistory(
    symbol?: string,
    page: number = 1,
    limit: number = 50
  ): Promise<PaginatedResponse<Trade>> {
    const params: any = { page, limit };
    if (symbol) params.symbol = symbol;
    
    const response = await apiClient.get<PaginatedResponse<Trade>>(API_CONFIG.ENDPOINTS.GET_TRADES, params);
    return response.data;
  }

  // Submit TWAP order
  async submitTWAP(twapRequest: TWAPOrderRequest): Promise<Order> {
    const response = await apiClient.post<Order>(API_CONFIG.ENDPOINTS.SUBMIT_TWAP, twapRequest);
    return response.data;
  }

  // Get order by ID
  async getOrder(orderId: string): Promise<Order> {
    const endpoint = buildUrl(API_CONFIG.ENDPOINTS.GET_ORDER, { order_id: orderId });
    const response = await apiClient.get<Order>(endpoint);
    return response.data;
  }

  // Modify an existing order (if supported by your backend)
  async modifyOrder(
    orderId: string, 
    modifications: Partial<PlaceOrderRequest>
  ): Promise<Order> {
    const endpoint = buildUrl(API_CONFIG.ENDPOINTS.MODIFY_ORDER, { order_id: orderId });
    const response = await apiClient.patch<Order>(endpoint, modifications);
    return response.data;
  }

  // Close position (market order for opposite side)
  async closePosition(symbol: string, quantity?: number): Promise<Order> {
    // If no quantity specified, close entire position
    // This would typically require getting current position size first
    const orderRequest: PlaceOrderRequest = {
      symbol,
      side: 'sell', // This would be determined by current position side
      type: 'market',
      quantity: quantity || 0, // Backend should handle position size calculation
      reduceOnly: true,
    };
    return this.placeOrder(orderRequest);
  }
}

export const ordersService = new OrdersService(); 