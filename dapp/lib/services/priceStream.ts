import { tradingService } from '../api/services/trading';

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  timestamp: number;
}

export interface OrderbookData {
  symbol: string;
  bids: [number, number][]; // [price, size]
  asks: [number, number][]; // [price, size]
  timestamp: number;
}

type StreamCallback = (data: PriceData) => void;
type OrderbookCallback = (data: OrderbookData) => void;

export class PriceStreamService {
  private subscribers: Map<string, Set<StreamCallback>> = new Map();
  private orderbookSubscribers: Map<string, Set<OrderbookCallback>> = new Map();
  private websockets: Map<string, WebSocket> = new Map();
  private pollingIntervals: Map<string, any> = new Map();
  private lastPrices: Map<string, PriceData> = new Map();
  private isPollingMode = false; // Use WebSocket for real streaming
  private baseUrl = process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:8000';
  private websocketUrl = this.baseUrl.replace('http', 'ws');

  // Subscribe to price updates for a symbol
  subscribe(symbol: string, callback: StreamCallback): () => void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
      this.startStream(symbol);
    }

    this.subscribers.get(symbol)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(symbol);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.stopStream(symbol);
          this.subscribers.delete(symbol);
        }
      }
    };
  }

  // Subscribe to orderbook updates for a symbol
  subscribeOrderbook(symbol: string, callback: OrderbookCallback): () => void {
    if (!this.orderbookSubscribers.has(symbol)) {
      this.orderbookSubscribers.set(symbol, new Set());
    }

    this.orderbookSubscribers.get(symbol)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.orderbookSubscribers.get(symbol);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.orderbookSubscribers.delete(symbol);
        }
      }
    };
  }

  // Get the last known price for a symbol
  getLastPrice(symbol: string): PriceData | null {
    return this.lastPrices.get(symbol) || null;
  }

  private startStream(symbol: string) {
    if (this.isPollingMode) {
      this.startPolling(symbol);
    } else {
      this.startWebSocket(symbol);
    }
  }

  private stopStream(symbol: string) {
    // Stop polling
    const interval = this.pollingIntervals.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(symbol);
    }

    // Close WebSocket
    const ws = this.websockets.get(symbol);
    if (ws) {
      ws.close();
      this.websockets.delete(symbol);
    }
  }

  private startPolling(symbol: string) {
    // Initial fetch
    this.fetchPrice(symbol);

    // Set up polling every 5 seconds
    const interval = setInterval(() => {
      this.fetchPrice(symbol);
    }, 5000);

    this.pollingIntervals.set(symbol, interval);
  }

  private async fetchPrice(symbol: string) {
    try {
      // First try to get price from Stark streaming endpoint
      try {
        const response = await fetch(`${this.baseUrl}/api/v1/stark/stream/prices/${symbol}/current`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const data = result.data;
            const priceData: PriceData = {
              symbol: data.symbol,
              price: data.price,
              change24h: data.change24h || 0,
              changePercent24h: data.changePercent24h || 0,
              high24h: data.high24h || data.price * 1.02,
              low24h: data.low24h || data.price * 0.98,
              volume24h: data.volume24h || 1500000000,
              timestamp: Date.now(),
            };

            this.lastPrices.set(symbol, priceData);
            this.notifySubscribers(symbol, priceData);
            return;
          }
        }
      } catch (starkError) {
        console.log(`Stark price endpoint failed, falling back to market stats: ${starkError}`);
      }

      // Fallback to existing market stats API
      const marketStats = await tradingService.getMarketStats(symbol);
      if (marketStats.length > 0) {
        const data = marketStats[0];
        const priceData: PriceData = {
          symbol: data.symbol,
          price: data.price,
          change24h: data.priceChange24h,
          changePercent24h: data.priceChangePercent24h,
          high24h: data.high24h,
          low24h: data.low24h,
          volume24h: data.volume24h,
          timestamp: Date.now(),
        };

        this.lastPrices.set(symbol, priceData);
        this.notifySubscribers(symbol, priceData);
      }
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
    }
  }

  private startWebSocket(symbol: string) {
    try {
      const wsUrl = `${this.websocketUrl}/api/v1/stark/stream/prices/${symbol}`;
      console.log(`Connecting to WebSocket: ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log(`WebSocket connected for ${symbol}`);
        // Send subscription message
        ws.send(JSON.stringify({ type: 'subscribe', symbol }));
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'price_update') {
            const priceData: PriceData = {
              symbol: data.symbol,
              price: data.price,
              change24h: 0, // Calculate from previous price if needed
              changePercent24h: 0, // Calculate from previous price if needed
              high24h: data.price * 1.02, // Estimate based on current price
              low24h: data.price * 0.98, // Estimate based on current price
              volume24h: 1500000000, // Default volume
              timestamp: Date.now(),
            };
            
            // Calculate 24h change if we have previous data
            const lastPrice = this.lastPrices.get(symbol);
            if (lastPrice) {
              const change = data.price - lastPrice.price;
              const changePercent = (change / lastPrice.price) * 100;
              priceData.change24h = change;
              priceData.changePercent24h = changePercent;
              priceData.high24h = Math.max(lastPrice.high24h, data.price);
              priceData.low24h = Math.min(lastPrice.low24h, data.price);
            }
            
            this.lastPrices.set(symbol, priceData);
            this.notifySubscribers(symbol, priceData);
          } else if (data.type === 'pong') {
            console.log(`Received pong from ${symbol} stream`);
          } else if (data.type === 'subscribed') {
            console.log(`Successfully subscribed to ${symbol}: ${data.message}`);
          }
        } catch (error) {
          console.error(`Error parsing WebSocket message for ${symbol}:`, error);
        }
      };
      
      ws.onerror = (error) => {
        console.error(`WebSocket error for ${symbol}:`, error);
        // Fallback to polling
        this.startPolling(symbol);
      };
      
      ws.onclose = (event) => {
        console.log(`WebSocket closed for ${symbol}:`, event.code, event.reason);
        this.websockets.delete(symbol);
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (this.subscribers.has(symbol) && this.subscribers.get(symbol)!.size > 0) {
            console.log(`Attempting to reconnect WebSocket for ${symbol}`);
            this.startWebSocket(symbol);
          }
        }, 5000);
      };
      
      this.websockets.set(symbol, ws);
      
      // Setup ping interval to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        } else {
          clearInterval(pingInterval);
        }
      }, 30000); // Ping every 30 seconds
      
    } catch (error) {
      console.error(`Failed to start WebSocket for ${symbol}:`, error);
      // Fallback to polling
      this.startPolling(symbol);
    }
  }

  private notifySubscribers(symbol: string, data: PriceData) {
    const callbacks = this.subscribers.get(symbol);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in price stream callback:', error);
        }
      });
    }
  }

  private notifyOrderbookSubscribers(symbol: string, data: OrderbookData) {
    const callbacks = this.orderbookSubscribers.get(symbol);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in orderbook stream callback:', error);
        }
      });
    }
  }

  // Cleanup all connections
  cleanup() {
    // Clear all polling intervals
    this.pollingIntervals.forEach(interval => clearInterval(interval));
    this.pollingIntervals.clear();

    // Close all WebSockets
    this.websockets.forEach(ws => ws.close());
    this.websockets.clear();

    // Clear subscribers
    this.subscribers.clear();
    this.orderbookSubscribers.clear();
    this.lastPrices.clear();
  }

  // Method to simulate real-time price changes (for demo purposes)
  startMockPriceStream(symbol: string, basePrice: number = 100000) {
    const interval = setInterval(() => {
      // Generate realistic price fluctuations
      const change = (Math.random() - 0.5) * 1000; // ±$500 variation
      const newPrice = basePrice + change;
      const changePercent = (change / basePrice) * 100;

      const mockData: PriceData = {
        symbol,
        price: newPrice,
        change24h: change,
        changePercent24h: changePercent,
        high24h: basePrice + 2000,
        low24h: basePrice - 2000,
        volume24h: 1000000000,
        timestamp: Date.now(),
      };

      this.lastPrices.set(symbol, mockData);
      this.notifySubscribers(symbol, mockData);

      // Update base price slightly for next iteration
      basePrice = newPrice;
    }, 2000); // Update every 2 seconds

    this.pollingIntervals.set(`mock_${symbol}`, interval);
  }
}

// Export singleton instance
export const priceStreamService = new PriceStreamService(); 