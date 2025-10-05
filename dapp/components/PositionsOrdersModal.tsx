import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import { createShadow, shadowPresets } from '../lib/platform-styles';
import { API_CONFIG } from '../lib/api/client';

const { width, height } = Dimensions.get('window');

interface Position {
  id: number;
  accountId: number;
  market: string;
  side: string;
  leverage: string;
  size: string;
  value: string;
  openPrice: string;
  markPrice: string;
  liquidationPrice: string;
  margin: string;
  unrealisedPnl: string;
  realisedPnl: string;
  tpTriggerPrice?: string;
  tpLimitPrice?: string;
  slTriggerPrice?: string;
  slLimitPrice?: string;
  adl: string;
  maxPositionSize: string;
  createdTime: number;
  updatedTime: number;
}

interface Order {
  id: number;
  accountId: number;
  externalId: string;
  market: string;
  type: string;
  side: string;
  status: string;
  statusReason?: string;
  price?: string;
  averagePrice?: string;
  qty: string;
  filledQty?: string;
  payedFee?: string;
  reduceOnly: boolean;
  postOnly: boolean;
  createdTime: number;
  updatedTime: number;
  timeInForce: string;
  expireTime: number;
}

interface PositionsOrdersModalProps {
  visible: boolean;
  onClose: () => void;
  market?: string; // Optional market filter
}

export const PositionsOrdersModal: React.FC<PositionsOrdersModalProps> = ({
  visible,
  onClose,
  market = 'BTC-USD', // Default to BTC-USD
}) => {
  const [activeTab, setActiveTab] = useState<'positions' | 'orders'>('positions');
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the same API configuration as the rest of the app
      const url = market 
        ? `${API_CONFIG.BASE_URL}/stark/positions?market=${encodeURIComponent(market)}`
        : `${API_CONFIG.BASE_URL}/stark/positions`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Positions response:', data);
      console.log('API URL used:', url);
      if (data.status === 'success' || data.status === 'ok') {
        setPositions(data.data || []);
        console.log('Positions set:', data.data);
      } else {
        setError('Failed to fetch positions');
      }
    } catch (err) {
      setError('Network error while fetching positions');
      console.error('Error fetching positions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the same API configuration as the rest of the app
      const url = market 
        ? `${API_CONFIG.BASE_URL}/stark/orders?market=${encodeURIComponent(market)}`
        : `${API_CONFIG.BASE_URL}/stark/orders`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Orders response:', data);
      console.log('API URL used:', url);
      if (data.status === 'success' || data.status === 'ok') {
        setOrders(data.data || []);
        console.log('Orders set:', data.data);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError('Network error while fetching orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      console.log('Modal opened, API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
      if (activeTab === 'positions') {
        fetchPositions();
      } else {
        fetchOrders();
      }
    }
  }, [visible, activeTab]);

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const formatPercentage = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'NEW':
      case 'PARTIALLY_FILLED':
        return '#F59E0B';
      case 'FILLED':
        return '#10B981';
      case 'CANCELLED':
      case 'REJECTED':
      case 'EXPIRED':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'NEW':
      case 'PARTIALLY_FILLED':
        return <Clock size={16} color="#F59E0B" />;
      case 'FILLED':
        return <CheckCircle size={16} color="#10B981" />;
      case 'CANCELLED':
      case 'REJECTED':
      case 'EXPIRED':
        return <XCircle size={16} color="#EF4444" />;
      default:
        return <AlertCircle size={16} color="#6B7280" />;
    }
  };

  const renderPosition = (position: Position) => {
    const unrealisedPnl = parseFloat(position.unrealisedPnl);
    const isProfit = unrealisedPnl >= 0;
    
    return (
      <View key={position.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.marketInfo}>
            <Text style={styles.marketSymbol}>{position.market}</Text>
            <View style={[
              styles.sideBadge,
              { backgroundColor: position.side === 'LONG' ? '#10B98120' : '#EF444420' }
            ]}>
              <Text style={[
                styles.sideText,
                { color: position.side === 'LONG' ? '#10B981' : '#EF4444' }
              ]}>
                {position.side}
              </Text>
            </View>
          </View>
          <View style={styles.leverageBadge}>
            <Text style={styles.leverageText}>{position.leverage}x</Text>
          </View>
        </View>

        <View style={styles.positionDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Size:</Text>
            <Text style={styles.detailValue}>{position.size} BTC</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Value:</Text>
            <Text style={styles.detailValue}>{formatPrice(position.value)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Open Price:</Text>
            <Text style={styles.detailValue}>{formatPrice(position.openPrice)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mark Price:</Text>
            <Text style={styles.detailValue}>{formatPrice(position.markPrice)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Unrealized PnL:</Text>
            <Text style={[
              styles.detailValue,
              { color: isProfit ? '#10B981' : '#EF4444' }
            ]}>
              {isProfit ? '+' : ''}{formatPrice(position.unrealisedPnl)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Liquidation Price:</Text>
            <Text style={styles.detailValue}>{formatPrice(position.liquidationPrice)}</Text>
          </View>
        </View>

        <View style={styles.positionFooter}>
          <Text style={styles.timestampText}>
            Created: {formatDate(position.createdTime)}
          </Text>
        </View>
      </View>
    );
  };

  const renderOrder = (order: Order) => {
    const fillPercentage = order.filledQty && order.qty 
      ? (parseFloat(order.filledQty) / parseFloat(order.qty)) * 100 
      : 0;

    return (
      <View key={order.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.marketInfo}>
            <Text style={styles.marketSymbol}>{order.market}</Text>
            <View style={[
              styles.sideBadge,
              { backgroundColor: order.side === 'BUY' ? '#10B98120' : '#EF444420' }
            ]}>
              <Text style={[
                styles.sideText,
                { color: order.side === 'BUY' ? '#10B981' : '#EF4444' }
              ]}>
                {order.side}
              </Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            {getStatusIcon(order.status)}
            <Text style={[
              styles.statusText,
              { color: getStatusColor(order.status) }
            ]}>
              {order.status}
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type:</Text>
            <Text style={styles.detailValue}>{order.type}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quantity:</Text>
            <Text style={styles.detailValue}>{order.qty} BTC</Text>
          </View>
          {order.filledQty && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Filled:</Text>
              <Text style={styles.detailValue}>
                {order.filledQty} BTC ({fillPercentage.toFixed(1)}%)
              </Text>
            </View>
          )}
          {order.price && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Price:</Text>
              <Text style={styles.detailValue}>{formatPrice(order.price)}</Text>
            </View>
          )}
          {order.averagePrice && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Avg Price:</Text>
              <Text style={styles.detailValue}>{formatPrice(order.averagePrice)}</Text>
            </View>
          )}
          {order.payedFee && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fee:</Text>
              <Text style={styles.detailValue}>{order.payedFee}</Text>
            </View>
          )}
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.timestampText}>
            Created: {formatDate(order.createdTime)}
          </Text>
          <Text style={styles.orderIdText}>
            ID: {order.externalId.slice(-8)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F0F23" />
      <LinearGradient
        colors={['#0F0F23', '#1A1A2E']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Positions & Orders</Text>
            <Text style={styles.subtitle}>{market}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'positions' && styles.activeTab
            ]}
            onPress={() => setActiveTab('positions')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'positions' && styles.activeTabText
            ]}>
              Positions ({positions.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'orders' && styles.activeTab
            ]}
            onPress={() => setActiveTab('orders')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'orders' && styles.activeTabText
            ]}>
              Orders ({orders.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => activeTab === 'positions' ? fetchPositions() : fetchOrders()}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>
                Loading {activeTab === 'positions' ? 'positions' : 'orders'}...
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {activeTab === 'positions' ? (
                positions.length > 0 ? (
                  positions.map(renderPosition)
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No open positions ({positions.length})</Text>
                    <Text style={styles.emptySubtext}>
                      Your positions will appear here when you have active trades
                    </Text>
                  </View>
                )
              ) : (
                orders.length > 0 ? (
                  orders.map(renderOrder)
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No orders found ({orders.length})</Text>
                    <Text style={styles.emptySubtext}>
                      Your orders will appear here when you place trades
                    </Text>
                  </View>
                )
              )}
            </ScrollView>
          )}
        </View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#B0B0B0',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#10B981',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B0B0B0',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#B0B0B0',
    marginTop: 12,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...createShadow(shadowPresets.medium),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  marketInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marketSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  sideBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sideText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  leverageBadge: {
    backgroundColor: '#3B82F620',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  leverageText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  positionDetails: {
    marginBottom: 12,
  },
  orderDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  positionFooter: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 8,
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestampText: {
    fontSize: 12,
    color: '#666',
  },
  orderIdText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B0B0B0',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
}); 