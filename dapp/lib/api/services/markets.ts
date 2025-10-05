import { apiClient, API_CONFIG } from '../client';
import { 
  Market, 
  MarketStats, 
  Orderbook, 
  Trade, 
  Candle, 
  FundingRate,
  PaginatedResponse 
} from '../types';

export class MarketsService {
  // Get all available markets
  async getMarkets(): Promise<Market[]> {
    console.log('📊 Fetching all markets...');
    try {
      const response = await apiClient.get<Market[]>(API_CONFIG.ENDPOINTS.GET_MARKETS);
      console.log(`✅ Fetched ${response.data.length} markets`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch markets:', error);
      throw error;
    }
  }

  // Get market-wide 24h statistics
  async getMarketStats(): Promise<MarketStats[]> {
    console.log('📈 Fetching market stats...');
    try {
      const response = await apiClient.get<any[]>(API_CONFIG.ENDPOINTS.GET_MARKET_STATS);
      console.log('📥 Raw market stats response:', response);
      console.log('📥 Response data type:', typeof response.data);
      console.log('📥 Response data array?:', Array.isArray(response.data));
      console.log('📥 Response data length:', response.data?.length);
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error('❌ Invalid response format:', response);
        return [];
      }
      
      // Transform backend format to frontend format
      const transformedData = response.data.map(stat => {
        console.log('🔍 Processing individual stat:', stat);
        console.log('🔍 Stat properties:', Object.keys(stat));
        
        // Ensure we have the required fields with proper fallbacks
        const price = Number(stat.price) || 0;
        const price24h = Number(stat.price_24h) || price;
        const volume24h = Number(stat.volume_24h) || 0;
        
        console.log('🔍 Parsed values:', { 
          rawPrice: stat.price, 
          rawPrice24h: stat.price_24h, 
          rawVolume: stat.volume_24h,
          parsedPrice: price, 
          parsedPrice24h: price24h, 
          parsedVolume: volume24h 
        });
        
        const transformed = {
          symbol: stat.symbol,
          lastPrice: price,
          priceChange24h: price - price24h,
          priceChangePercent24h: price24h !== 0 ? ((price - price24h) / price24h) * 100 : 0,
          volume24h: volume24h,
          high24h: Number(stat.high_24h) || price,  // fallback to current price
          low24h: Number(stat.low_24h) || price24h,  // fallback to 24h price
          openPrice24h: price24h
        };
        
        console.log(`🔄 Transformed market stats for ${stat.symbol}:`, {
          original: stat,
          transformed
        });
        
        return transformed;
      });

      console.log(`✅ Transformed ${transformedData.length} market stats:`, transformedData);
      return transformedData;
    } catch (error) {
      console.error('❌ Failed to fetch market stats:', error);
      throw error;
    }
  }

  // Get market stats for specific symbol
  async getMarketStatsForSymbol(symbol: string): Promise<MarketStats> {
    const response = await apiClient.get<MarketStats>(`markets/${symbol}/stats`);
    return response.data;
  }

  // Get orderbook for a specific market
  async getOrderbook(symbol: string, depth: number = 20): Promise<Orderbook> {
    const response = await apiClient.get<Orderbook>(`markets/${symbol}/orderbook`, { depth });
    return response.data;
  }

  // Get recent trades for a specific market
  async getTrades(symbol: string, limit: number = 50): Promise<Trade[]> {
    const response = await apiClient.get<Trade[]>(`markets/${symbol}/trades`, { limit });
    return response.data;
  }

  // Get historical candles/klines
  async getCandles(
    symbol: string, 
    interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' = '1h',
    limit: number = 100,
    startTime?: number,
    endTime?: number
  ): Promise<Candle[]> {
    const params: any = { interval, limit };
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;
    
    const response = await apiClient.get<Candle[]>(`markets/${symbol}/candles`, params);
    return response.data;
  }

  // Get funding rates
  async getFundingRates(): Promise<FundingRate[]> {
    const response = await apiClient.get<FundingRate[]>('markets/funding');
    return response.data;
  }

  // Get funding rate for specific symbol
  async getFundingRate(symbol: string): Promise<FundingRate> {
    const response = await apiClient.get<FundingRate>(`markets/${symbol}/funding`);
    return response.data;
  }

  // Search markets by symbol or name
  async searchMarkets(query: string): Promise<Market[]> {
    const response = await apiClient.get<Market[]>('markets/search', { q: query });
    return response.data;
  }

  // Get trending markets (most active)
  async getTrendingMarkets(limit: number = 10): Promise<MarketStats[]> {
    console.log(`🔥 Fetching trending markets (limit: ${limit})...`);
    try {
      const response = await apiClient.get<any[]>(API_CONFIG.ENDPOINTS.GET_TRENDING_MARKETS, { limit });
      console.log('📥 Raw trending markets response:', response);
      
      // The trending endpoint already returns data in the correct format
      // but let's ensure all fields are present
      const transformedData = response.data.map(stat => {
        const transformed = {
          symbol: stat.symbol,
          lastPrice: stat.lastPrice,
          priceChange24h: stat.priceChange24h,
          priceChangePercent24h: stat.priceChangePercent24h,
          volume24h: stat.volume24h,
          high24h: stat.high24h,
          low24h: stat.low24h,
          openPrice24h: stat.openPrice24h
        };
        
        console.log(`🔄 Transformed trending data for ${stat.symbol}:`, {
          original: stat,
          transformed
        });
        
        return transformed;
      });

      console.log(`✅ Transformed ${transformedData.length} trending markets`);
      return transformedData;
    } catch (error) {
      console.error('❌ Failed to fetch trending markets:', error);
      throw error;
    }
  }
}

export const marketsService = new MarketsService(); 