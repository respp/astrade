import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown, BarChart3, Clock } from 'lucide-react-native';
import { createShadow, shadowPresets } from '../lib/platform-styles';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;
const CHART_HEIGHT = 120;
const CANDLE_WIDTH = 8;
const CANDLE_SPACING = 2;

export interface CandleData {
  T: number; // timestamp
  o: string; // open
  h: string; // high
  l: string; // low
  c: string; // close
  v?: string; // volume (optional)
}

export interface CandleStreamData {
  ts: number;
  data: CandleData[];
  seq: number;
}

interface CandleChartProps {
  market: string;
  candleType?: 'trades' | 'mark-prices' | 'index-prices';
  interval?: string;
  onCandleUpdate?: (candles: CandleData[]) => void;
}

const INTERVALS = [
  { label: '1m', value: 'PT1M' },
  { label: '5m', value: 'PT5M' },
  { label: '15m', value: 'PT15M' },
  { label: '1h', value: 'PT1H' },
  { label: '4h', value: 'PT4H' },
  { label: '1d', value: 'PT24H' },
];

const CANDLE_TYPES = [
  { label: 'Trades', value: 'trades' },
  { label: 'Mark', value: 'mark-prices' },
  { label: 'Index', value: 'index-prices' },
];

export const CandleChart: React.FC<CandleChartProps> = ({
  market,
  candleType = 'trades',
  interval = 'PT1M',
  onCandleUpdate,
}) => {
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInterval, setSelectedInterval] = useState(interval);
  const [selectedCandleType, setSelectedCandleType] = useState('index-prices'); // Always use mark-prices
  const [showDebug, setShowDebug] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const priceWsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const priceReconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate chart dimensions and visible candles
  // For 1-minute candles, use smaller spacing and adjust width to fit more candles
  const isOneMinute = selectedInterval === 'PT1M';
  const candleSpacing = isOneMinute ? CANDLE_SPACING * 0.3 : CANDLE_SPACING;
  const candleWidth = isOneMinute ? CANDLE_WIDTH * 0.8 : CANDLE_WIDTH; // Slightly thinner for 1min
  const maxCandles = Math.floor(CHART_WIDTH / (candleWidth + candleSpacing));
  const visibleCandles = candles.slice(-maxCandles);
  
  console.log(`📊 Chart state: ${candles.length} total candles, showing last ${visibleCandles.length} candles`);

  // Fetch historical candles from API
  const fetchHistoricalCandles = async () => {
    try {
      setIsLoadingHistory(true);
      setError(null);
      
      console.log(`🔄 Fetching historical candles for ${market}...`);
      
      // Use backend proxy to avoid CORS issues
      const baseUrl = process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:8000';
      const url = `${baseUrl}/api/v1/stark/candles/${market}/${selectedCandleType}?interval=${selectedInterval}&limit=20`;
      
      console.log(`📡 API URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });
      
      console.log(`📡 Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(`📈 Historical candles response:`, result);
      
      // Handle backend proxy response format
      let candlesData = null;
      
      // Check if result.data contains the Extended Exchange response
      if (result.status === 'ok' && result.data) {
        console.log(`🔍 Backend response data structure:`, result.data);
        
        // Check if data.data contains the candle array
        if (result.data.data && Array.isArray(result.data.data)) {
          candlesData = result.data.data;
          console.log(`✅ Found candle data in result.data.data:`, candlesData.length, 'candles');
        }
        // Check if data itself is the candle array (direct from Extended Exchange)
        else if (Array.isArray(result.data)) {
          candlesData = result.data;
          console.log(`✅ Found candle data in result.data:`, candlesData.length, 'candles');
        }
        // Check if data has nested structure with status and data
        else if (result.data.status === 'OK' && Array.isArray(result.data.data)) {
          candlesData = result.data.data;
          console.log(`✅ Found candle data in result.data.status/result.data.data:`, candlesData.length, 'candles');
        }
        else {
          console.log(`🔍 Debugging response structure:`, {
            status: result.status,
            hasData: !!result.data,
            dataType: typeof result.data,
            dataKeys: result.data ? Object.keys(result.data) : null,
            nestedData: result.data?.data ? Array.isArray(result.data.data) : false,
            directArray: Array.isArray(result.data)
          });
        }
      } else if (result.status === 'success' && result.data && result.data.status === 'OK' && Array.isArray(result.data.data)) {
        // Backend proxy response format (expected)
        candlesData = result.data.data;
      } else if (result.status === 'OK' && result.data && Array.isArray(result.data)) {
        // Direct API response format (fallback)
        candlesData = result.data;
      }
      
      if (candlesData) {
        if (candlesData.length === 0) {
          console.warn(`⚠️ No historical data returned for ${market}`);
          setError('No historical data available');
          return;
        }
        
        // Sort by timestamp ascending (oldest first)
        const sortedCandles = candlesData.sort((a: CandleData, b: CandleData) => a.T - b.T);
        console.log(`✅ Loaded ${sortedCandles.length} historical candles for ${market}`);
        console.log(`📅 Date range: ${new Date(sortedCandles[0].T).toISOString()} to ${new Date(sortedCandles[sortedCandles.length - 1].T).toISOString()}`);
        
        setCandles(sortedCandles);
        onCandleUpdate?.(sortedCandles);
        setError(null);
        console.log(`🎯 Successfully loaded ${sortedCandles.length} historical candles - chart should now show multiple bars`);
      } else {
        console.error(`❌ Invalid response format:`, result);
        console.log(`🔍 Full response structure:`, JSON.stringify(result, null, 2));
        throw new Error(`Invalid response format: ${result.status || 'Unknown status'}. Expected data.data array but got: ${JSON.stringify(result.data)}`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to fetch historical candles for ${market}:`, error);
      
      // Check if it's a CORS error and provide helpful message
      if (error instanceof Error && error.message.includes('CORS')) {
        setError(`CORS Error: Cannot load historical data directly from browser. WebSocket will provide live updates only.`);
      } else {
        setError(`Failed to load historical data: ${error instanceof Error ? error.message : 'API unavailable'}`);
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };


  // Get interval in milliseconds
  const getIntervalMs = (interval: string): number => {
    switch (interval) {
      case 'PT1M': return 60 * 1000;
      case 'PT5M': return 5 * 60 * 1000;
      case 'PT15M': return 15 * 60 * 1000;
      case 'PT1H': return 60 * 60 * 1000;
      case 'PT4H': return 4 * 60 * 60 * 1000;
      case 'PT24H': return 24 * 60 * 60 * 1000;
      default: return 60 * 1000;
    }
  };

  // Calculate price range
  const prices = visibleCandles.flatMap(candle => [
    parseFloat(candle.h),
    parseFloat(candle.l),
    parseFloat(candle.o),
    parseFloat(candle.c),
  ]);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  const padding = priceRange * 0.1; // 10% padding

  // Connect to price WebSocket for real-time price updates only
  const connectPriceWebSocket = () => {
    if (priceWsRef.current?.readyState === WebSocket.OPEN) {
      priceWsRef.current.close();
    }

    const priceWsUrl = `wss://api.starknet.extended.exchange/stream.extended.exchange/v1/prices/mark/${market}`;
    console.log(`🔄 Connecting to price WebSocket: ${priceWsUrl}`);

    try {
      const priceWs = new WebSocket(priceWsUrl);
      priceWsRef.current = priceWs;

      priceWs.onopen = () => {
        console.log(`✅ Price WebSocket connected for ${market}`);
        setIsConnected(true);
        setError(null);
      };

      priceWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(`💰 Received price update for ${market}:`, data);

          // Handle mark price updates
          if (data.type === 'MP' && data.data && data.data.m === market) {
            const currentPrice = parseFloat(data.data.p);
            const timestamp = data.data.ts || Date.now();
            
            if (isNaN(currentPrice) || currentPrice === 0) {
              console.warn(`⚠️ Invalid price received for ${market}:`, data.data.p);
              return;
            }

            setCandles(prevCandles => {
              // Only update if we have historical candles loaded
              if (prevCandles.length === 0) {
                console.log(`⚠️ No historical candles loaded yet, skipping price update`);
                return prevCandles;
              }
              
              const updatedCandles = [...prevCandles];
              const lastIndex = updatedCandles.length - 1;
              
              if (lastIndex >= 0) {
                const lastCandle = updatedCandles[lastIndex];
                const timeDiff = timestamp - lastCandle.T;
                const intervalMs = getIntervalMs(selectedInterval);
                
                if (Math.abs(timeDiff) < intervalMs) {
                  // Same time period - update ONLY the current candle's close price and high/low
                  const updatedCandle = {
                    ...lastCandle,
                    c: currentPrice.toString(), // Update close price
                    h: Math.max(parseFloat(lastCandle.h), currentPrice).toString(), // Update high if current price is higher
                    l: Math.min(parseFloat(lastCandle.l), currentPrice).toString(), // Update low if current price is lower
                  };
                  updatedCandles[lastIndex] = updatedCandle;
                  console.log(`🔄 Updated current candle close price to $${currentPrice} (preserving historical data)`);
                } else {
                  console.log(`⚠️ Price update for different time period, ignoring`);
                  return prevCandles;
                }
              }
              
              onCandleUpdate?.(updatedCandles);
              return updatedCandles;
            });
          }
        } catch (error) {
          console.error(`❌ Error parsing price data for ${market}:`, error);
        }
      };

      priceWs.onerror = (error) => {
        console.error(`❌ Price WebSocket error for ${market}:`, error);
        setError('Price WebSocket connection error');
        setIsConnected(false);
      };

      priceWs.onclose = (event) => {
        console.log(`🔌 Price WebSocket closed for ${market}:`, event.code, event.reason);
        setIsConnected(false);

        // Attempt to reconnect after 5 seconds
        if (priceReconnectTimeoutRef.current) {
          clearTimeout(priceReconnectTimeoutRef.current);
        }
        priceReconnectTimeoutRef.current = setTimeout(() => {
          console.log(`🔄 Attempting to reconnect price stream for ${market}`);
          connectPriceWebSocket();
        }, 5000);
      };
    } catch (error) {
      console.error(`❌ Failed to start price WebSocket for ${market}:`, error);
      setError('Failed to connect to price WebSocket');
    }
  };

  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    setIsLoading(true);
    setError(null);

    const wsUrl = `wss://api.starknet.extended.exchange/stream.extended.exchange/v1/candles/${market}/${selectedCandleType}?interval=${selectedInterval}`;
    console.log(`🔄 Connecting to candle WebSocket: ${wsUrl}`);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`✅ Candle WebSocket connected for ${market}`);
        setIsConnected(true);
        setIsLoading(false);
        setError(null); // Clear any previous errors
      };

      ws.onmessage = (event) => {
        try {
          const data: CandleStreamData = JSON.parse(event.data);
          console.log(`📊 Received live candle update for ${market}:`, data);

          if (data.data && Array.isArray(data.data) && data.data.length > 0) {
            setCandles(prevCandles => {
              // Only update if we have historical candles loaded
              if (prevCandles.length === 0) {
                console.log(`⚠️ No historical candles loaded yet, skipping live update`);
                return prevCandles;
              }
              
              // Get the latest candle from the stream (for real-time updates)
              const latestCandle = data.data[data.data.length - 1];
              console.log(`🕯️ Latest live candle:`, latestCandle);
              console.log(`📈 Live price data - O: ${latestCandle.o}, H: ${latestCandle.h}, L: ${latestCandle.l}, C: ${latestCandle.c}`);
              
              const updatedCandles = [...prevCandles];
              const lastIndex = updatedCandles.length - 1;
              
              if (lastIndex >= 0) {
                // Check if this is an update to the current candle or a new time period
                const lastCandle = updatedCandles[lastIndex];
                const timeDiff = latestCandle.T - lastCandle.T;
                const intervalMs = getIntervalMs(selectedInterval);
                
                if (Math.abs(timeDiff) < intervalMs) {
                  // Same time period - update ONLY the current candle with live data
                  // Keep the original open price but update high, low, close
                  const updatedCandle = {
                    ...lastCandle,
                    h: latestCandle.h, // Update high
                    l: latestCandle.l, // Update low  
                    c: latestCandle.c, // Update close
                    v: latestCandle.v || lastCandle.v // Update volume if available
                  };
                  updatedCandles[lastIndex] = updatedCandle;
                  console.log(`🔄 Updated current candle with live data (preserving original open: ${lastCandle.o})`);
                } else if (timeDiff > intervalMs) {
                  // New time period - add new candle and keep last 20
                  updatedCandles.push(latestCandle);
                  console.log(`➕ Added new candle for new time period`);
                  // Keep only last 20 candles to match historical data limit
                  const limitedCandles = updatedCandles.slice(-20);
                  onCandleUpdate?.(limitedCandles);
                  return limitedCandles;
                } else {
                  console.log(`⚠️ Received older candle data, ignoring`);
                  return prevCandles;
                }
              }
              
              // Clear error once we start receiving live data
              setError(null);
              
              console.log(`✅ Chart now has ${updatedCandles.length} candles (latest updated with live data)`);
              onCandleUpdate?.(updatedCandles);
              return updatedCandles;
            });
          }
        } catch (error) {
          console.error(`❌ Error parsing live candle data for ${market}:`, error);
        }
      };

      ws.onerror = (error) => {
        console.error(`❌ Candle WebSocket error for ${market}:`, error);
        setError('WebSocket connection error');
        setIsConnected(false);
        setIsLoading(false);
      };

      ws.onclose = (event) => {
        console.log(`🔌 Candle WebSocket closed for ${market}:`, event.code, event.reason);
        setIsConnected(false);
        setIsLoading(false);

        // Attempt to reconnect after 5 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`🔄 Attempting to reconnect candle stream for ${market}`);
          connectWebSocket();
        }, 5000);
      };
    } catch (error) {
      console.error(`❌ Failed to start candle WebSocket for ${market}:`, error);
      setError('Failed to connect to WebSocket');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeChart = async () => {
      // First fetch historical candles from API
      await fetchHistoricalCandles();
      
      // Then connect to price WebSocket for real-time price updates only
      connectPriceWebSocket();
    };

    initializeChart();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (priceWsRef.current) {
        priceWsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (priceReconnectTimeoutRef.current) {
        clearTimeout(priceReconnectTimeoutRef.current);
      }
    };
  }, [market, selectedInterval, selectedCandleType]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderCandle = (candle: CandleData, index: number) => {
    const open = parseFloat(candle.o);
    const close = parseFloat(candle.c);
    const high = parseFloat(candle.h);
    const low = parseFloat(candle.l);

    const isGreen = close >= open;
    const color = isGreen ? '#10B981' : '#EF4444';
    const bodyColor = isGreen ? '#10B981' : '#EF4444';

    // Calculate positions using dynamic spacing and width
    const x = index * (candleWidth + candleSpacing);
    const highY = ((maxPrice + padding - high) / (priceRange + 2 * padding)) * CHART_HEIGHT;
    const lowY = ((maxPrice + padding - low) / (priceRange + 2 * padding)) * CHART_HEIGHT;
    const openY = ((maxPrice + padding - open) / (priceRange + 2 * padding)) * CHART_HEIGHT;
    const closeY = ((maxPrice + padding - close) / (priceRange + 2 * padding)) * CHART_HEIGHT;

    const bodyTop = Math.min(openY, closeY);
    const bodyHeight = Math.abs(closeY - openY) || (isOneMinute ? 2 : 1); // Minimum height for 1min candles

    return (
      <View key={`${candle.T}-${index}`} style={[styles.candleContainer, { left: x, width: candleWidth }]}>
        {/* Upper wick */}
        <View
          style={[
            styles.wick,
            {
              top: highY,
              height: Math.min(openY, closeY) - highY,
              backgroundColor: color,
              left: candleWidth / 2 - 0.5, // Center the wick
            },
          ]}
        />
        {/* Lower wick */}
        <View
          style={[
            styles.wick,
            {
              top: Math.max(openY, closeY) + bodyHeight,
              height: lowY - (Math.max(openY, closeY) + bodyHeight),
              backgroundColor: color,
              left: candleWidth / 2 - 0.5, // Center the wick
            },
          ]}
        />
        {/* Body */}
        <View
          style={[
            styles.candleBody,
            {
              top: bodyTop,
              width: candleWidth,
              height: bodyHeight,
              backgroundColor: bodyColor,
              borderColor: bodyColor,
              borderWidth: 1,
            },
          ]}
        />
      </View>
    );
  };

  const getPriceChange = () => {
    if (candles.length < 2) return { change: 0, percent: 0 };
    
    const first = parseFloat(candles[0].c);
    const last = parseFloat(candles[candles.length - 1].c);
    const change = last - first;
    const percent = (change / first) * 100;
    
    return { change, percent };
  };

  const priceChange = getPriceChange();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0F23', '#1A1A2E']}
        style={styles.chartContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <BarChart3 size={20} color="#10B981" />
            <Text style={styles.marketText}>{market}</Text>
            <View style={[
              styles.connectionIndicator,
              { backgroundColor: isConnected ? '#10B981' : isLoadingHistory ? '#F59E0B' : '#EF4444' }
            ]} />
            <Text style={styles.connectionText}>
              {isLoadingHistory ? 'Connecting...' : isConnected ? 'Real Data' : 'Disconnected'}
            </Text>
            {error && (
              <TouchableOpacity 
                style={styles.refreshButton} 
                onPress={() => {
                  fetchHistoricalCandles();
                  connectPriceWebSocket();
                }}
              >
                <Text style={styles.refreshButtonText}>↻</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.headerRight}>
            {priceChange.change !== 0 && (
              <View style={[
                styles.priceChange,
                { backgroundColor: priceChange.change >= 0 ? '#10B98120' : '#EF444420' }
              ]}>
                {priceChange.change >= 0 ? (
                  <TrendingUp size={14} color="#10B981" />
                ) : (
                  <TrendingDown size={14} color="#EF4444" />
                )}
                <Text style={[
                  styles.changeText,
                  { color: priceChange.change >= 0 ? '#10B981' : '#EF4444' }
                ]}>
                  {priceChange.change >= 0 ? '+' : ''}{priceChange.percent.toFixed(2)}%
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Interval:</Text>
            {INTERVALS.map((int) => (
              <TouchableOpacity
                key={int.value}
                style={[
                  styles.controlButton,
                  selectedInterval === int.value && styles.controlButtonActive
                ]}
                onPress={() => setSelectedInterval(int.value)}
              >
                <Text style={[
                  styles.controlButtonText,
                  selectedInterval === int.value && styles.controlButtonTextActive
                ]}>
                  {int.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Chart Area */}
        <View style={styles.chartArea}>
          {isLoadingHistory ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Loading historical candles...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
              <Text style={styles.errorSubtext}>
                {candles.length > 0 ? 'Showing real data' : 'Waiting for real data from WebSocket'}
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => {
                fetchHistoricalCandles();
                connectPriceWebSocket();
              }}>
                <Text style={styles.retryButtonText}>Retry API</Text>
              </TouchableOpacity>
            </View>
          ) : candles.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Waiting for real market data...</Text>
              <Text style={styles.loadingSubtext}>Building chart from live WebSocket stream...</Text>
            </View>
          ) : (
            <View style={styles.chart}>
              {/* Grid lines */}
              <View style={styles.gridContainer}>
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                  <View
                    key={index}
                    style={[
                      styles.gridLine,
                      {
                        top: ratio * CHART_HEIGHT,
                        opacity: ratio === 0.5 ? 0.3 : 0.1,
                      },
                    ]}
                  />
                ))}
              </View>
              
              {/* Price labels */}
              <View style={styles.priceLabels}>
                <Text style={styles.priceLabel}>{formatPrice(maxPrice + padding)}</Text>
                <Text style={styles.priceLabel}>{formatPrice(maxPrice + padding * 0.5)}</Text>
                <Text style={styles.priceLabel}>{formatPrice((maxPrice + minPrice) / 2)}</Text>
                <Text style={styles.priceLabel}>{formatPrice(minPrice - padding * 0.5)}</Text>
                <Text style={styles.priceLabel}>{formatPrice(minPrice - padding)}</Text>
              </View>
              
              {/* Candles */}
              <View style={styles.candlesContainer}>
                {visibleCandles.map((candle, index) => renderCandle(candle, index))}
              </View>
              
              {/* Time labels */}
              <View style={styles.timeLabels}>
                <Text style={styles.timeLabel}>
                  {visibleCandles.length > 0 ? formatTime(visibleCandles[0].T) : ''}
                </Text>
                <Text style={styles.timeLabel}>
                  {visibleCandles.length > 0 ? formatTime(visibleCandles[visibleCandles.length - 1].T) : ''}
                </Text>
              </View>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 5,
  },
  chartContainer: {
    borderRadius: 12,
    padding: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  marketText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    fontSize: 10,
    color: '#B0B0B0',
    marginLeft: 4,
  },
  refreshButton: {
    marginLeft: 8,
    padding: 4,
    backgroundColor: '#10B981',
    borderRadius: 4,
    minWidth: 20,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  debugButton: {
    marginLeft: 4,
    padding: 4,
    backgroundColor: '#F59E0B',
    borderRadius: 4,
    minWidth: 20,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  controlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlLabel: {
    fontSize: 12,
    color: '#B0B0B0',
    marginRight: 4,
  },
  controlButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#333',
  },
  controlButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  controlButtonText: {
    fontSize: 10,
    color: '#B0B0B0',
    fontWeight: '500',
  },
  controlButtonTextActive: {
    color: '#fff',
  },
  chartArea: {
    height: CHART_HEIGHT + 30,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#B0B0B0',
    marginTop: 8,
    fontSize: 14,
  },
  loadingSubtext: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  errorSubtext: {
    color: '#B0B0B0',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chart: {
    flex: 1,
    position: 'relative',
  },
  gridContainer: {
    position: 'absolute',
    left: 40,
    top: 0,
    width: CHART_WIDTH - 40,
    height: CHART_HEIGHT,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#333',
  },
  priceLabels: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: CHART_HEIGHT,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  priceLabel: {
    fontSize: 10,
    color: '#666',
    backgroundColor: '#0F0F23',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  candlesContainer: {
    position: 'absolute',
    left: 40,
    top: 0,
    width: CHART_WIDTH - 40,
    height: CHART_HEIGHT,
    zIndex: 1,
  },
  candleContainer: {
    position: 'absolute',
    width: CANDLE_WIDTH,
    height: CHART_HEIGHT,
  },
  wick: {
    position: 'absolute',
    width: 1,
    left: CANDLE_WIDTH / 2 - 0.5,
  },
  candleBody: {
    position: 'absolute',
    width: CANDLE_WIDTH,
    left: 0,
    borderRadius: 2,
  },
  timeLabels: {
    position: 'absolute',
    bottom: 0,
    left: 40,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  timeLabel: {
    fontSize: 10,
    color: '#666',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#B0B0B0',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
});
