import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Wifi, WifiOff, RefreshCw, Activity } from 'lucide-react-native';
import { useMultiplePriceStreams } from '@/lib/hooks/usePriceStream';

export default function WebSocketMarkPriceTest() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  // Test markets
  const testMarkets = ['BTC-USD', 'ETH-USD', 'STRK-USD'];
  const { pricesData, connections, errors } = useMultiplePriceStreams(testMarkets);

  useEffect(() => {
    // Check connection status
    const allConnected = testMarkets.every(market => connections.get(market));
    setIsConnected(allConnected);

    // Update last update time when we get new data
    const hasNewData = testMarkets.some(market => pricesData.get(market)?.price);
    if (hasNewData) {
      setLastUpdate(new Date());
    }

    // Log test results
    const results: string[] = [];
    testMarkets.forEach(market => {
      const isMarketConnected = connections.get(market);
      const priceData = pricesData.get(market);
      const error = errors.get(market);
      
      results.push(`${market}: ${isMarketConnected ? '✅ Connected' : '❌ Disconnected'}`);
      if (priceData?.price) {
        results.push(`  Price: $${priceData.price.toFixed(2)}`);
      }
      if (error) {
        results.push(`  Error: ${error}`);
      }
    });

    setTestResults(results);
  }, [pricesData, connections, errors, testMarkets]);

  const runConnectionTest = () => {
    const results: string[] = [];
    results.push(`🔄 Connection Test - ${new Date().toLocaleTimeString()}`);
    
    testMarkets.forEach(market => {
      const isMarketConnected = connections.get(market);
      const priceData = pricesData.get(market);
      const error = errors.get(market);
      
      results.push(`\n${market}:`);
      results.push(`  Status: ${isMarketConnected ? '🟢 Connected' : '🔴 Disconnected'}`);
      results.push(`  Price: ${priceData?.price ? `$${priceData.price.toFixed(2)}` : 'N/A'}`);
      results.push(`  Volume: ${priceData?.volume24h ? `$${priceData.volume24h.toLocaleString()}` : 'N/A'}`);
      if (error) {
        results.push(`  Error: ${error}`);
      }
    });

    setTestResults(results);
    Alert.alert('Test Results', results.join('\n'));
  };

  const getConnectionStatus = () => {
    const connectedCount = testMarkets.filter(market => connections.get(market)).length;
    return `${connectedCount}/${testMarkets.length} markets connected`;
  };

  return (
    <LinearGradient colors={['#0a0a0f', '#0f0f1a', '#1a1a2e']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔌 WebSocket Connection Test</Text>
        <Text style={styles.subtitle}>Test real-time price feeds for active markets</Text>
      </View>

      <View style={styles.statusContainer}>
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            {isConnected ? (
              <Wifi size={20} color="#10B981" />
            ) : (
              <WifiOff size={20} color="#EF4444" />
            )}
            <Text style={[
              styles.statusText,
              { color: isConnected ? '#10B981' : '#EF4444' }
            ]}>
              {isConnected ? 'All Connected' : 'Connection Issues'}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Activity size={20} color="#bf7af0" />
            <Text style={styles.statusText}>
              {getConnectionStatus()}
            </Text>
          </View>
        </View>

        {lastUpdate && (
          <Text style={styles.lastUpdateText}>
            Last update: {lastUpdate.toLocaleTimeString()}
          </Text>
        )}
      </View>

      <View style={styles.marketStatus}>
        <Text style={styles.sectionTitle}>Market Status</Text>
        {testMarkets.map(market => {
          const isMarketConnected = connections.get(market);
          const priceData = pricesData.get(market);
          const error = errors.get(market);
          
          return (
            <View key={market} style={styles.marketCard}>
              <View style={styles.marketHeader}>
                <Text style={styles.marketSymbol}>{market}</Text>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: isMarketConnected ? '#10B981' : '#EF4444' }
                ]} />
              </View>
              
              <View style={styles.marketData}>
                <Text style={styles.priceText}>
                  {priceData?.price ? `$${priceData.price.toFixed(2)}` : 'No data'}
                </Text>
                <Text style={styles.volumeText}>
                  Vol: {priceData?.volume24h ? `$${priceData.volume24h.toLocaleString()}` : 'N/A'}
                </Text>
                {error && (
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.testButton} onPress={runConnectionTest}>
          <RefreshCw size={16} color="#FFFFFF" />
          <Text style={styles.buttonText}>Run Test</Text>
        </TouchableOpacity>
      </View>

      {testResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Test Results</Text>
          <ScrollView style={styles.resultsScroll}>
            {testResults.map((result, index) => (
              <Text key={index} style={styles.resultText}>{result}</Text>
            ))}
          </ScrollView>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#bf7af0',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  statusContainer: {
    backgroundColor: 'rgba(191, 122, 240, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.3)',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#a0a0a0',
    textAlign: 'center',
  },
  marketStatus: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#bf7af0',
    marginBottom: 12,
  },
  marketCard: {
    backgroundColor: 'rgba(191, 122, 240, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.3)',
  },
  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  marketSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  marketData: {
    gap: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  volumeText: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
  },
  actions: {
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#bf7af0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#bf7af0',
    marginBottom: 12,
  },
  resultsScroll: {
    flex: 1,
  },
  resultText: {
    fontSize: 12,
    color: '#a0a0a0',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});
