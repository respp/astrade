import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTradingDemo } from '../lib/hooks/useTradingDemo';
import { useTradingErrorHandler } from '../lib/hooks/useTradingErrorHandler';
import { createShadow, shadowPresets } from '../lib/platform-styles';
import { InsufficientBalanceModal } from './InsufficientBalanceModal';

export const TradingDemo: React.FC = () => {
  const {
    demoMarketBuy,
    demoMarketSell,
    demoLimitBuy,
    demoLimitSell,
    isPlacingOrder,
    orders,
    getDemoStats,
  } = useTradingDemo();

  const {
    showInsufficientBalance,
    handleTradeError,
    closeInsufficientBalanceModal
  } = useTradingErrorHandler();

  const stats = getDemoStats();

  const handleTrade = async (tradeFunction: () => Promise<any>, tradeName: string) => {
    try {
      // Simulate insufficient balance error randomly (30% chance)
      const shouldFail = Math.random() < 0.3;
      
      if (shouldFail) {
        // Simulate insufficient balance error
        const error = new Error('Insufficient balance for this trade');
        handleTradeError(error);
        return;
      }

      const order = await tradeFunction();
      Alert.alert(
        'Trade Executed!',
        `${tradeName} completed successfully. Order ID: ${order.id.slice(-8)}`,
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      handleTradeError(error);
    }
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#0F0F23', '#1A1A2E'] as unknown as readonly [string, string, ...string[]]}
          style={styles.background}
        >
          <View style={styles.header}>
            <Text style={styles.title}>🚀 Quick Trade</Text>
            <Text style={styles.subtitle}>
              Execute trades to complete missions
            </Text>
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Trading Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalOrders}</Text>
                <Text style={styles.statLabel}>Total Orders</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.buyOrders}</Text>
                <Text style={styles.statLabel}>Buy Orders</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.sellOrders}</Text>
                <Text style={styles.statLabel}>Sell Orders</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>${stats.totalVolume.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Total Volume</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Market Orders</Text>
            <Text style={styles.sectionDescription}>
              Execute immediately at current market price
            </Text>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.tradeButton, styles.buyButton, createShadow(shadowPresets.medium)]}
                onPress={() => handleTrade(demoMarketBuy, 'Market Buy')}
                disabled={isPlacingOrder}
              >
                <Text style={styles.tradeButtonText}>
                  {isPlacingOrder ? 'Trading...' : 'Market Buy BTC'}
                </Text>
                <Text style={styles.tradeButtonSubtext}>0.001 BTC</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tradeButton, styles.sellButton, createShadow(shadowPresets.medium)]}
                onPress={() => handleTrade(demoMarketSell, 'Market Sell')}
                disabled={isPlacingOrder}
              >
                <Text style={styles.tradeButtonText}>
                  {isPlacingOrder ? 'Trading...' : 'Market Sell BTC'}
                </Text>
                <Text style={styles.tradeButtonSubtext}>0.001 BTC</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Limit Orders</Text>
            <Text style={styles.sectionDescription}>
              Set specific price for order execution
            </Text>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.tradeButton, styles.buyButton, createShadow(shadowPresets.medium)]}
                onPress={() => handleTrade(demoLimitBuy, 'Limit Buy')}
                disabled={isPlacingOrder}
              >
                <Text style={styles.tradeButtonText}>
                  {isPlacingOrder ? 'Trading...' : 'Limit Buy BTC'}
                </Text>
                <Text style={styles.tradeButtonSubtext}>@$50,000</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tradeButton, styles.sellButton, createShadow(shadowPresets.medium)]}
                onPress={() => handleTrade(demoLimitSell, 'Limit Sell')}
                disabled={isPlacingOrder}
              >
                <Text style={styles.tradeButtonText}>
                  {isPlacingOrder ? 'Trading...' : 'Limit Sell ETH'}
                </Text>
                <Text style={styles.tradeButtonSubtext}>@$3,000</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>💡 Trading Tips</Text>
            <View style={styles.instructionsList}>
              <Text style={styles.instruction}>• Market orders execute immediately at current price</Text>
              <Text style={styles.instruction}>• Limit orders let you set your desired price</Text>
              <Text style={styles.instruction}>• Complete trades to progress in missions</Text>
              <Text style={styles.instruction}>• Check Galaxy to track your achievements</Text>
            </View>
          </View>

          {orders.length > 0 && (
            <View style={styles.ordersCard}>
              <Text style={styles.ordersTitle}>Recent Orders</Text>
              {orders.slice(0, 3).map((order, index) => (
                <View key={order.id} style={styles.orderItem}>
                  <View style={styles.orderHeader}>
                    <Text style={[
                      styles.orderSide,
                      order.side === 'buy' ? styles.buyText : styles.sellText
                    ]}>
                      {order.side.toUpperCase()}
                    </Text>
                    <Text style={styles.orderType}>{order.type}</Text>
                  </View>
                  <Text style={styles.orderSymbol}>{order.symbol}</Text>
                  <Text style={styles.orderQuantity}>
                    {order.quantity} @ ${order.price?.toLocaleString() || 'Market'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </LinearGradient>
      </ScrollView>

      {/* Insufficient Balance Modal */}
      <InsufficientBalanceModal
        visible={showInsufficientBalance}
        onClose={closeInsufficientBalanceModal}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 12,
    color: '#B0B0B0',
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tradeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  buyButton: {
    backgroundColor: '#10B981',
  },
  sellButton: {
    backgroundColor: '#EF4444',
  },
  tradeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tradeButtonSubtext: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  instructionsCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 12,
  },
  instructionsList: {
    paddingLeft: 8,
  },
  instruction: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 8,
    lineHeight: 20,
  },
  ordersCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
  },
  ordersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  orderItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderSymbol: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderSide: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  buyText: {
    color: '#10B981',
  },
  sellText: {
    color: '#EF4444',
  },
  orderType: {
    color: '#B0B0B0',
    fontSize: 12,
  },
  orderQuantity: {
    color: '#fff',
    fontSize: 12,
  },
}); 