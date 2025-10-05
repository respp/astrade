import { useState, useEffect, useCallback, useRef } from 'react';
import { priceStreamService, PriceData, OrderbookData } from '../services/priceStream';

export interface UsePriceStreamOptions {
  symbol: string;
  enableMockMode?: boolean;
  mockBasePrice?: number;
}

export const usePriceStream = (options: UsePriceStreamOptions) => {
  const { symbol, enableMockMode = false, mockBasePrice = 100000 } = options;
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Subscribe to price updates
  useEffect(() => {
    if (!symbol) return;

    setError(null);
    setIsConnected(false);

    const handlePriceUpdate = (data: PriceData) => {
      setPriceData(data);
      setIsConnected(true);
      setError(null);
    };

    const handleError = (err: any) => {
      console.error('Price stream error:', err);
      setError(err.message || 'Failed to connect to price stream');
      setIsConnected(false);
    };

    try {
      // Subscribe to price updates
      const unsubscribe = priceStreamService.subscribe(symbol, handlePriceUpdate);
      unsubscribeRef.current = unsubscribe;

      // Start mock mode if enabled
      if (enableMockMode) {
        priceStreamService.startMockPriceStream(symbol, mockBasePrice);
      }

      // Get initial price if available
      const lastPrice = priceStreamService.getLastPrice(symbol);
      if (lastPrice) {
        setPriceData(lastPrice);
        setIsConnected(true);
      }
    } catch (err) {
      handleError(err);
    }

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [symbol, enableMockMode, mockBasePrice]);

  // Manual refresh function
  const refresh = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    
    const handlePriceUpdate = (data: PriceData) => {
      setPriceData(data);
      setIsConnected(true);
      setError(null);
    };

    const unsubscribe = priceStreamService.subscribe(symbol, handlePriceUpdate);
    unsubscribeRef.current = unsubscribe;
  }, [symbol]);

  return {
    priceData,
    isConnected,
    error,
    refresh,
  };
};

export interface UseOrderbookStreamOptions {
  symbol: string;
}

export const useOrderbookStream = (options: UseOrderbookStreamOptions) => {
  const { symbol } = options;
  const [orderbookData, setOrderbookData] = useState<OrderbookData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!symbol) return;

    setError(null);
    setIsConnected(false);

    const handleOrderbookUpdate = (data: OrderbookData) => {
      setOrderbookData(data);
      setIsConnected(true);
      setError(null);
    };

    const handleError = (err: any) => {
      console.error('Orderbook stream error:', err);
      setError(err.message || 'Failed to connect to orderbook stream');
      setIsConnected(false);
    };

    try {
      const unsubscribe = priceStreamService.subscribeOrderbook(symbol, handleOrderbookUpdate);
      unsubscribeRef.current = unsubscribe;
    } catch (err) {
      handleError(err);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [symbol]);

  return {
    orderbookData,
    isConnected,
    error,
  };
};

// Hook for multiple symbols
export const useMultiplePriceStreams = (symbols: string[]) => {
  const [pricesData, setPricesData] = useState<Map<string, PriceData>>(new Map());
  const [connections, setConnections] = useState<Map<string, boolean>>(new Map());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const unsubscribesRef = useRef<Map<string, () => void>>(new Map());

  useEffect(() => {
    // Clean up existing subscriptions
    unsubscribesRef.current.forEach(unsubscribe => unsubscribe());
    unsubscribesRef.current.clear();

    const newPricesData = new Map<string, PriceData>();
    const newConnections = new Map<string, boolean>();
    const newErrors = new Map<string, string>();

    symbols.forEach(symbol => {
      const handlePriceUpdate = (data: PriceData) => {
        setPricesData(prev => new Map(prev.set(symbol, data)));
        setConnections(prev => new Map(prev.set(symbol, true)));
        setErrors(prev => {
          const newMap = new Map(prev);
          newMap.delete(symbol);
          return newMap;
        });
      };

      const handleError = (err: any) => {
        console.error(`Price stream error for ${symbol}:`, err);
        setErrors(prev => new Map(prev.set(symbol, err.message || 'Connection failed')));
        setConnections(prev => new Map(prev.set(symbol, false)));
      };

      try {
        const unsubscribe = priceStreamService.subscribe(symbol, handlePriceUpdate);
        unsubscribesRef.current.set(symbol, unsubscribe);

        // Get initial price if available
        const lastPrice = priceStreamService.getLastPrice(symbol);
        if (lastPrice) {
          newPricesData.set(symbol, lastPrice);
          newConnections.set(symbol, true);
        } else {
          newConnections.set(symbol, false);
        }
      } catch (err) {
        handleError(err);
      }
    });

    setPricesData(newPricesData);
    setConnections(newConnections);
    setErrors(newErrors);

    return () => {
      unsubscribesRef.current.forEach(unsubscribe => unsubscribe());
      unsubscribesRef.current.clear();
    };
  }, [symbols.join(',')]); // Re-run when symbols array changes

  return {
    pricesData,
    connections,
    errors,
  };
}; 