import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { TrendingUp, TrendingDown, Zap, BarChart2, Wifi, WifiOff } from 'lucide-react-native';
import SearchBar from '@/components/SearchBar';
import { marketsService } from '@/lib/api/services/markets';
import type { Market, MarketStats } from '@/lib/api/types';
import { router } from 'expo-router';
import { useMultiplePriceStreams } from '@/lib/hooks/usePriceStream';
import WebSocketMarkPriceTest from '@/components/WebSocketMarkPriceTest';

export default function TradeStation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [markets, setMarkets] = useState<(Market & MarketStats)[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendingMarkets, setTrendingMarkets] = useState<MarketStats[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showWebSocketTest, setShowWebSocketTest] = useState(false);

  // Real-time price monitoring for the 3 active markets
  const activeMarkets = ['BTC-USD', 'ETH-USD', 'STRK-USD'];
  const { pricesData, connections, errors } = useMultiplePriceStreams(activeMarkets);

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Refreshing market data at:', new Date().toISOString());
      // Get all markets and their stats in parallel
      const [marketsData, marketStats, trendingData] = await Promise.all([
        marketsService.getMarkets(),
        marketsService.getMarketStats(),
        marketsService.getTrendingMarkets(10)
      ]);

      console.log('📊 Markets Data:', marketsData);
      console.log('📈 Market Stats:', marketStats);
      console.log('🔥 Trending Data:', trendingData);

      // Transform backend data to match frontend types
      const transformedMarkets = marketsData.map((market: any) => ({
        symbol: market.symbol,
        baseAsset: market.base_asset || market.baseAsset,
        quoteAsset: market.quote_asset || market.quoteAsset,
        displayName: market.display_name,
        status: market.status,
        tickSize: market.tick_size,
        stepSize: market.step_size,
        minOrderSize: market.min_order_size,
        maxOrderSize: market.max_order_size,
        makerFee: market.maker_fee,
        takerFee: market.taker_fee,
        fundingInterval: market.funding_interval,
        maxLeverage: market.max_leverage,
        isActive: market.is_active
      }));

      // Use trending data as primary source since it has correct values
      // Fall back to market stats if trending data doesn't have a market
      const combinedMarkets = transformedMarkets.map(market => {
        // First try to find in trending data (which has correct values)
        let stats = trendingData.find(stat => stat.symbol === market.symbol);
        
        // If not found in trending, try market stats
        if (!stats) {
          stats = marketStats.find(stat => stat.symbol === market.symbol);
        }
        
        console.log(`🔄 Processing market ${market.symbol}:`, { 
          market, 
          stats,
          baseAsset: market.baseAsset,
          quoteAsset: market.quoteAsset
        });
        
        if (!stats) {
          console.warn(`⚠️ No stats found for market ${market.symbol}`);
        }
        
        return {
          ...market,
          ...(stats || {
            lastPrice: 0,
            priceChange24h: 0,
            priceChangePercent24h: 0,
            volume24h: 0,
            high24h: 0,
            low24h: 0,
            openPrice24h: 0
          })
        };
      });

      console.log('✅ Combined Markets:', combinedMarkets);
      
      // Filter to show only the 3 active markets
      const filteredActiveMarkets = combinedMarkets.filter(market => 
        activeMarkets.includes(market.symbol)
      );
      
      console.log('🎯 Active Markets Filtered:', filteredActiveMarkets.map(m => m.symbol));
      
      setMarkets(filteredActiveMarkets);
      setTrendingMarkets(trendingData.filter(stat => activeMarkets.includes(stat.symbol)));
      setError(null);
    } catch (err) {
      setError('Failed to load market data. Please try again.');
      console.error('❌ Market data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Merge real-time price data with market data
  const marketsWithRealTimePrices = markets.map(market => {
    const realTimeData = pricesData.get(market.symbol);
    if (realTimeData && realTimeData.price > 0) {
      console.log(`✅ Using real-time price for ${market.symbol}: $${realTimeData.price}`);
      return {
        ...market,
        lastPrice: realTimeData.price,
        priceChange24h: realTimeData.change24h,
        priceChangePercent24h: realTimeData.changePercent24h,
        volume24h: realTimeData.volume24h,
        high24h: realTimeData.high24h,
        low24h: realTimeData.low24h,
        // Keep other market data from the original source
      };
    } else if (realTimeData) {
      console.warn(`⚠️ Real-time data for ${market.symbol} has invalid price: ${realTimeData.price}`);
    } else {
      console.log(`📊 Using static market data for ${market.symbol}: $${market.lastPrice}`);
    }
    return market;
  });

  const filteredMarkets = marketsWithRealTimePrices.filter(market =>
    market.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    market.baseAsset.toLowerCase().includes(searchQuery.toLowerCase()) ||
    market.quoteAsset.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTotalVolume = () => {
    return marketsWithRealTimePrices.reduce((total, market) => total + (market.volume24h || 0), 0);
  };

  const getMarketColor = (change: number) => {
    return change >= 0 ? '#10B981' : '#EF4444';
  };

  const formatPrice = (price: number | undefined) => {
    if (!price && price !== 0) return '0.00';
    return price < 0.01 ? price.toFixed(8) : price.toFixed(2);
  };

  const formatChange = (change: number | undefined) => {
    if (!change && change !== 0) return '+0.00%';
    return (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
  };

  const formatVolume = (volume: number | undefined) => {
    if (!volume && volume !== 0) return '0.00';
    if (volume >= 1e9) return (volume / 1e9).toFixed(2) + 'B';
    if (volume >= 1e6) return (volume / 1e6).toFixed(2) + 'M';
    if (volume >= 1e3) return (volume / 1e3).toFixed(2) + 'K';
    return volume.toFixed(2);
  };

  // Check if any market has connection issues
  const hasConnectionIssues = Array.from(connections.values()).some(connected => !connected);
  const hasPriceErrors = Array.from(errors.values()).some(error => !!error);
  
  // Debug connection status
  console.log('🔍 Connection Status Debug:');
  activeMarkets.forEach(market => {
    const isConnected = connections.get(market);
    const error = errors.get(market);
    const priceData = pricesData.get(market);
    console.log(`${market}: Connected=${isConnected}, Error=${error}, Price=${priceData?.price || 'N/A'}`);
  });

  if (loading) {
    return (
      <LinearGradient colors={['#0a0a0f', '#0f0f1a', '#1a1a2e']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#bf7af0" />
        <Text style={styles.loadingText}>Loading market data...</Text>
      </LinearGradient>
    );
  }

  // Show WebSocket test component if toggled
  if (showWebSocketTest) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowWebSocketTest(false)}
          >
            <Text style={styles.backButtonText}>← Back to Markets</Text>
          </TouchableOpacity>
          <Text style={styles.title}>WebSocket Mark Price Test</Text>
        </View>
        <WebSocketMarkPriceTest />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#0a0a0f', '#0f0f1a', '#1a1a2e']} style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>🚀 Trade Station</Text>
        <Text style={styles.subtitle}>
          Trade the most active markets: BTC, ETH, and STRK. Choose one to start trading.
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search markets..."
        />
      </View>

      {/* Connection Status Indicator */}
      {/* <View style={styles.connectionStatus}>
        <View style={styles.connectionIndicator}>
          {hasConnectionIssues ? (
            <WifiOff size={16} color="#EF4444" />
          ) : (
            <Wifi size={16} color="#10B981" />
          )}
          <Text style={[
            styles.connectionText,
            { color: hasConnectionIssues ? '#EF4444' : '#10B981' }
          ]}>
            {hasConnectionIssues ? 'Price Feed Offline' : 'Live Prices'}
          </Text>
        </View>
      </View> */}

      <View style={styles.marketStats}>
        <View style={styles.statItem}>
          <BarChart2 size={20} color="#bf7af0" />
          <Text style={styles.statLabel}>Markets</Text>
          <Text style={styles.statValue}>{markets.length}</Text>
        </View>
        <View style={styles.statItem}>
          <Zap size={20} color="#bf7af0" />
          <Text style={styles.statLabel}>24h Volume</Text>
          <Text style={styles.statValue}>${formatVolume(getTotalVolume())}</Text>
        </View>
      </View>

      <ScrollView style={styles.marketsList} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Markets</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.testButton}
              onPress={() => setShowWebSocketTest(true)}
            >
              <Text style={styles.testButtonText}>Test WS</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={() => {
                console.log('🔄 Manual WebSocket refresh triggered');
                // Force refresh by reloading market data
                loadMarketData();
              }}
            >
              <Text style={styles.debugButtonText}>Debug</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={loadMarketData}>
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadMarketData}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {filteredMarkets.map((market) => {
              const isConnected = connections.get(market.symbol) || false;
              const priceError = errors.get(market.symbol);
              
              return (
                <TouchableOpacity
                  key={market.symbol}
                  style={styles.marketCard}
                  onPress={() => {
                    console.log('🚀 Navigating to trading with market:', market.symbol);
                    router.push({
                      pathname: '/(tabs)/trading',
                      params: { market: market.symbol }
                    });
                  }}
                >
                  <View style={styles.marketInfo}>
                    <View style={styles.marketHeader}>
                      <Text style={styles.marketSymbol}>{market.symbol}</Text>
                      <View style={styles.connectionDot}>
                        {isConnected ? (
                          <View style={[styles.dot, styles.connectedDot]} />
                        ) : (
                          <View style={[styles.dot, styles.disconnectedDot]} />
                        )}
                      </View>
                    </View>
                    <Text style={styles.marketName}>
                      {market.baseAsset}/{market.quoteAsset}
                    </Text>
                    {priceError && (
                      <Text style={styles.priceErrorText}>⚠️ Price unavailable</Text>
                    )}
                  </View>
                  
                  <View style={styles.marketData}>
                    <Text style={styles.marketPrice}>
                      ${formatPrice(market.lastPrice)}
                    </Text>
                    <Text style={[
                      styles.marketChange,
                      { color: getMarketColor(market.priceChangePercent24h) }
                    ]}>
                      {formatChange(market.priceChangePercent24h)}
                    </Text>
                    <Text style={styles.marketVolume}>
                      Vol ${formatVolume(market.volume24h)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#a0a0a0',
    marginTop: 12,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#bf7af0',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
    lineHeight: 22,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  connectionStatus: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  marketStats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 15,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'rgba(191, 122, 240, 0.1)',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.3)',
    alignItems: 'center',
    shadowColor: '#bf7af0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    marginTop: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#bf7af0',
    marginTop: 4,
  },
  marketsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#bf7af0',
  },
  refreshText: {
    color: '#bf7af0',
    fontSize: 14,
  },
  marketCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(191, 122, 240, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.3)',
    shadowColor: '#bf7af0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  marketInfo: {
    flex: 1,
  },
  marketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  marketSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  connectionDot: {
    width: 8,
    height: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectedDot: {
    backgroundColor: '#10B981',
  },
  disconnectedDot: {
    backgroundColor: '#EF4444',
  },
  marketName: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  priceErrorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  marketData: {
    alignItems: 'flex-end',
  },
  marketPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  marketChange: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  marketVolume: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  testButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  debugButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});