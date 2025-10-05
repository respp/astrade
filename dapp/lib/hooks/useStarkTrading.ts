import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { 
  starkTradingService, 
  StarkOrderRequest, 
  StarkOrderResponse, 
  StarkAccountInfo,
  StarkHealthStatus 
} from '../api/services/stark';
import { missionEngine, MissionEngine } from '../missions/engine';

export interface StarkTradingState {
  accountInfo: StarkAccountInfo | null;
  healthStatus: StarkHealthStatus | null;
  orders: StarkOrderResponse[];
  isLoading: boolean;
  isPlacingOrder: boolean;
  lastError: string | null;
}

export const useStarkTrading = () => {
  const [state, setState] = useState<StarkTradingState>({
    accountInfo: null,
    healthStatus: null,
    orders: [],
    isLoading: false,
    isPlacingOrder: false,
    lastError: null,
  });

  // Load initial data
  const loadAccountData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, lastError: null }));
      
      // Load account info and health status in parallel
      const [accountInfo, healthStatus] = await Promise.allSettled([
        starkTradingService.getAccountInfo(),
        starkTradingService.getHealthStatus(),
      ]);

      setState(prev => ({
        ...prev,
        accountInfo: accountInfo.status === 'fulfilled' ? accountInfo.value : null,
        healthStatus: healthStatus.status === 'fulfilled' ? healthStatus.value : null,
        lastError: accountInfo.status === 'rejected' ? accountInfo.reason.message : null,
      }));
    } catch (error) {
      console.error('Failed to load Stark account data:', error);
      setState(prev => ({
        ...prev,
        lastError: error instanceof Error ? error.message : 'Unknown error',
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Initialize the Stark client
  const initializeClient = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, lastError: null }));
      
      const result = await starkTradingService.initializeClient();
      
      // Reload account data after initialization
      await loadAccountData();
      
      Alert.alert('✅ Client Initialized', result.message);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize client';
      setState(prev => ({ ...prev, lastError: errorMessage }));
      Alert.alert('❌ Initialization Failed', errorMessage);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [loadAccountData]);

  // Place a Stark order
  const placeOrder = useCallback(async (orderRequest: StarkOrderRequest): Promise<StarkOrderResponse> => {
    try {
      setState(prev => ({ ...prev, isPlacingOrder: true, lastError: null }));
      
      const order = await starkTradingService.createOrder(orderRequest);
      
      // Add to local orders list
      setState(prev => ({
        ...prev,
        orders: [order, ...prev.orders].slice(0, 20), // Keep last 20 orders
      }));

      // Process mission event
      try {
        const tradingEvent = MissionEngine.createTradeEvent({
          id: order.external_id,
          symbol: order.market_name,
          side: order.side.toLowerCase() as 'buy' | 'sell',
          type: order.post_only ? 'limit' : 'market',
          quantity: parseFloat(order.amount),
          price: parseFloat(order.price),
          status: 'filled',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          filledQuantity: parseFloat(order.amount),
          remainingQuantity: 0,
        });
        
        const progress = missionEngine.processEvent('user', tradingEvent);
        if (progress.some(p => p.status === 'completed')) {
          Alert.alert('🎉 Mission Complete!', 'Check Galaxy for your rewards!');
        }
      } catch (missionError) {
        console.log('Mission processing failed:', missionError);
      }

      return order;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order';
      setState(prev => ({ ...prev, lastError: errorMessage }));
      throw error;
    } finally {
      setState(prev => ({ ...prev, isPlacingOrder: false }));
    }
  }, []);

  // Cancel an order
  const cancelOrder = useCallback(async (orderExternalId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, lastError: null }));
      
      const result = await starkTradingService.cancelOrder(orderExternalId);
      
      // Update local orders list
      setState(prev => ({
        ...prev,
        orders: prev.orders.map(order => 
          order.external_id === orderExternalId 
            ? { ...order, status: 'cancelled' }
            : order
        ),
      }));

      Alert.alert('✅ Order Cancelled', `Order ${orderExternalId.slice(-8)} has been cancelled`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';
      setState(prev => ({ ...prev, lastError: errorMessage }));
      Alert.alert('❌ Cancellation Failed', errorMessage);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Convenience trading methods
  const quickBuy = useCallback(async (amount: string = '0.0001', price?: string, market: string = 'BTC-USD') => {
    const orderPrice = price || '100000'; // Default BTC price
    return placeOrder({
      amount_of_synthetic: amount,
      price: orderPrice,
      market_name: market,
      side: 'BUY',
      post_only: false,
    });
  }, [placeOrder]);

  const quickSell = useCallback(async (amount: string = '0.0001', price?: string, market: string = 'BTC-USD') => {
    const orderPrice = price || '100000'; // Default BTC price
    return placeOrder({
      amount_of_synthetic: amount,
      price: orderPrice,
      market_name: market,
      side: 'SELL',
      post_only: false,
    });
  }, [placeOrder]);

  const limitBuy = useCallback(async (amount: string = '0.0001', price: string = '95000') => {
    return placeOrder({
      amount_of_synthetic: amount,
      price: price,
      market_name: 'BTC-USD',
      side: 'BUY',
      post_only: true,
    });
  }, [placeOrder]);

  const limitSell = useCallback(async (amount: string = '0.0001', price: string = '105000') => {
    return placeOrder({
      amount_of_synthetic: amount,
      price: price,
      market_name: 'BTC-USD',
      side: 'SELL',
      post_only: true,
    });
  }, [placeOrder]);

  // Load data on mount
  useEffect(() => {
    loadAccountData();
  }, [loadAccountData]);

  // Statistics
  const getStats = useCallback(() => {
    const buyOrders = state.orders.filter(o => o.side === 'BUY').length;
    const sellOrders = state.orders.filter(o => o.side === 'SELL').length;
    const totalVolume = state.orders.reduce((sum, order) => 
      sum + (parseFloat(order.amount) * parseFloat(order.price)), 0
    );

    return {
      totalOrders: state.orders.length,
      buyOrders,
      sellOrders,
      totalVolume,
      isHealthy: state.healthStatus?.status === 'healthy',
      isInitialized: state.accountInfo?.initialized || false,
    };
  }, [state.orders, state.healthStatus, state.accountInfo]);

  return {
    // State
    ...state,
    
    // Actions
    loadAccountData,
    initializeClient,
    placeOrder,
    cancelOrder,
    
    // Quick trading methods
    quickBuy,
    quickSell,
    limitBuy,
    limitSell,
    
    // Statistics
    getStats,
  };
}; 