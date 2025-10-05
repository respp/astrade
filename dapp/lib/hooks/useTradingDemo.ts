import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { missionEngine, MissionEngine } from '../missions/engine';
import { Order, PlaceOrderRequest } from '../api/types';

// Demo trading hook for testing missions without real API
export const useTradingDemo = () => {
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  // Execute a trade and update missions
  const placeDemoOrder = useCallback(async (orderRequest: PlaceOrderRequest): Promise<Order> => {
    try {
      setIsPlacingOrder(true);

      // Create order with current timestamp
      const timestamp = Date.now();
      const demoOrder: Order = {
        id: `order_${timestamp}_${Math.random().toString(36).slice(2, 9)}`,
        symbol: orderRequest.symbol,
        side: orderRequest.side,
        type: orderRequest.type,
        quantity: orderRequest.quantity,
        price: orderRequest.price || (orderRequest.symbol === 'BTC-USDT' ? 50000 : 3000),
        status: 'filled',
        createdAt: timestamp,
        updatedAt: timestamp,
        filledQuantity: orderRequest.quantity,
        remainingQuantity: 0,
      };

      // Simular delay realista
      await new Promise(resolve => setTimeout(resolve, 500));

      // Actualizar estado local
      setOrders(prev => [demoOrder, ...prev].slice(0, 10)); // Keep last 10 orders

      // Procesar misión
      const tradingEvent = MissionEngine.createTradeEvent(demoOrder);
      const progress = missionEngine.processEvent('demo-user', tradingEvent);

      // Notificar progreso
      if (progress.length > 0) {
        const completed = progress.filter(p => p.status === 'completed');
        if (completed.length > 0) {
          Alert.alert('🎉 Mission Complete!', 'Check Galaxy for your rewards!');
        }
      }

      return demoOrder;
    } catch (error) {
      console.error('Trade failed:', error);
      throw error;
    } finally {
      setIsPlacingOrder(false);
    }
  }, []);

  // Quick demo trade functions
  const demoMarketBuy = useCallback((symbol: string = 'BTC-USDT', quantity: number = 0.001) => {
    return placeDemoOrder({
      symbol,
      side: 'buy',
      type: 'market',
      quantity,
    });
  }, [placeDemoOrder]);

  const demoMarketSell = useCallback((symbol: string = 'BTC-USDT', quantity: number = 0.001) => {
    return placeDemoOrder({
      symbol,
      side: 'sell',
      type: 'market',
      quantity,
    });
  }, [placeDemoOrder]);

  const demoLimitBuy = useCallback((symbol: string = 'BTC-USDT', quantity: number = 0.001, price: number = 50000) => {
    return placeDemoOrder({
      symbol,
      side: 'buy',
      type: 'limit',
      quantity,
      price,
    });
  }, [placeDemoOrder]);

  const demoLimitSell = useCallback((symbol: string = 'ETH-USDT', quantity: number = 0.01, price: number = 3000) => {
    return placeDemoOrder({
      symbol,
      side: 'sell',
      type: 'limit',
      quantity,
      price,
    });
  }, [placeDemoOrder]);

  // Get demo trading statistics
  const getDemoStats = useCallback(() => {
    const buyOrders = orders.filter(o => o.side === 'buy').length;
    const sellOrders = orders.filter(o => o.side === 'sell').length;
    const marketOrders = orders.filter(o => o.type === 'market').length;
    const limitOrders = orders.filter(o => o.type === 'limit').length;
    const totalVolume = orders.reduce((sum, order) => 
      sum + (order.quantity * (order.price || 50000)), 0 // Assume avg price for market orders
    );

    return {
      totalOrders: orders.length,
      buyOrders,
      sellOrders,
      marketOrders,
      limitOrders,
      totalVolume,
    };
  }, [orders]);

  return {
    // Order management
    placeDemoOrder,
    isPlacingOrder,
    orders,
    
    // Quick trade functions
    demoMarketBuy,
    demoMarketSell,
    demoLimitBuy,
    demoLimitSell,
    
    // Statistics
    getDemoStats,
  };
}; 