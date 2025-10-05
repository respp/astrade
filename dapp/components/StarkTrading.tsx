import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Image,
  Animated,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useStarkTrading } from '../lib/hooks/useStarkTrading';
import { usePriceStream } from '../lib/hooks/usePriceStream';
import { useTradingErrorHandler } from '../lib/hooks/useTradingErrorHandler';
import { createShadow, shadowPresets } from '../lib/platform-styles';
import { TrendingUp, TrendingDown, Wifi, WifiOff, AlertCircle, BarChart3 } from 'lucide-react-native';
import { InsufficientBalanceModal } from './InsufficientBalanceModal';
import { PositionsOrdersModal } from './PositionsOrdersModal';
import { 
  validateQuantity, 
  formatQuantity, 
  getAssetSymbol, 
  getDefaultQuantity,
  getMarketConfig
} from '../lib/utils/marketUtils';

// Import animation files
const buyAnimation = require('../assets/images/animations/buy.json');
const sellAnimation = require('../assets/images/animations/sell.json');

// Import trading icons
const buyIcon = require('../assets/images/trading/BUY.png');
const sellIcon = require('../assets/images/trading/SELL.png');

const { width, height } = Dimensions.get('window');

interface StarkTradingProps {
  market?: string;
}

export const StarkTrading: React.FC<StarkTradingProps> = ({ market = 'BTC-USD' }) => {
  const {
    accountInfo,
    isLoading,
    isPlacingOrder,
    lastError,
    loadAccountData,
    initializeClient,
    quickBuy,
    quickSell,
    getStats,
  } = useStarkTrading();

  // Price streaming for real-time prices
  const {
    priceData,
    isConnected: isPriceConnected,
    error: priceError,
    refresh: refreshPrice,
  } = usePriceStream({ 
    symbol: market, 
    enableMockMode: false,
    mockBasePrice: 100000
  });

  const {
    showInsufficientBalance,
    handleTradeError,
    closeInsufficientBalanceModal
  } = useTradingErrorHandler();

  // Modal state
  const [showPositionsOrdersModal, setShowPositionsOrdersModal] = useState(false);

  // Custom quantity state
  const [customAmount, setCustomAmount] = useState(getDefaultQuantity(market));
  const [quantityError, setQuantityError] = useState('');
  
  // Animation state and refs
  const [showBuyAnimation, setShowBuyAnimation] = useState(false);
  const [showSellAnimation, setShowSellAnimation] = useState(false);
  const buyAnimationRef = useRef<LottieView>(null);
  const sellAnimationRef = useRef<LottieView>(null);

  // Shake animation values
  const buyIconShake = useRef(new Animated.Value(0)).current;
  const sellIconShake = useRef(new Animated.Value(0)).current;

  const stats = getStats();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatPercentage = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  // Validate quantity input
  const validateQuantityInput = (value: string) => {
    setQuantityError('');
    
    if (!value || value.trim() === '') {
      setQuantityError('Quantity is required');
      return false;
    }

    const validation = validateQuantity(value, market);
    if (!validation.isValid) {
      setQuantityError(validation.error || 'Invalid quantity');
      return false;
    }

    return true;
  };

  // Handle quantity change
  const handleQuantityChange = (value: string) => {
    // Only allow numbers and decimal points
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Get market-specific decimal limit
    const stepSize = getMarketConfig(market).stepSize;
    const maxDecimals = stepSize.toString().split('.')[1]?.length || 0;
    
    // Limit decimal places based on market step size
    if (parts[1] && parts[1].length > maxDecimals) {
      return;
    }

    setCustomAmount(cleanValue);
    validateQuantityInput(cleanValue);
  };

  // Shake animation functions
  const createShakeAnimation = (animatedValue: Animated.Value) => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: -1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        // Add a pause at the end before restarting
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      { iterations: -1 } // Infinite loop
    );
  };

  // Start shake animations
  useEffect(() => {
    const buyShake = createShakeAnimation(buyIconShake);
    const sellShake = createShakeAnimation(sellIconShake);
    
    buyShake.start();
    sellShake.start();

    return () => {
      buyShake.stop();
      sellShake.stop();
    };
  }, []);

  // Update quantity when market changes
  useEffect(() => {
    setCustomAmount(getDefaultQuantity(market));
    setQuantityError('');
  }, [market]);

  const playBuyAnimation = () => {
    setShowBuyAnimation(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    buyAnimationRef.current?.play();
    setTimeout(() => setShowBuyAnimation(false), 2000);
  };

  const playSellAnimation = () => {
    setShowSellAnimation(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    sellAnimationRef.current?.play();
    setTimeout(() => setShowSellAnimation(false), 2000);
  };

  const handleTrade = async (tradeFunction: () => Promise<any>, tradeName: string, tradeType: 'buy' | 'sell') => {
    try {
      // Validate inputs before trading
      if (!priceData?.price) {
        Alert.alert('❌ Price Error', 'Price data is not available. Please wait for price to load.');
        return;
      }

      if (!validateQuantityInput(customAmount)) {
        Alert.alert('❌ Invalid Quantity', quantityError || 'Please enter a valid quantity.');
        return;
      }

      // Play animation before executing trade
      if (tradeType === 'buy') {
        playBuyAnimation();
      } else {
        playSellAnimation();
      }

      const order = await tradeFunction();
      Alert.alert(
        '🚀 Trade Executed!',
        `${tradeName} completed successfully!\nOrder ID: ${order.external_id.slice(-8)}\nStatus: ${order.status}`,
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      setShowBuyAnimation(false);
      setShowSellAnimation(false);
      handleTradeError(error, lastError || undefined);
    }
  };

  const formatPriceForOrder = (price: number) => {
    // Round to 2 decimal places for precision compatibility with Stark API
    return Math.round(price).toString();
  };

  const handleBuy = () => {
    const formattedPrice = priceData?.price 
      ? formatPriceForOrder(priceData.price)
      : '100000';
    
    handleTrade(
      () => quickBuy(customAmount, formattedPrice, market),
      'Market Buy',
      'buy'
    );
  };

  const handleSell = () => {
    const formattedPrice = priceData?.price 
      ? formatPriceForOrder(priceData.price)
      : '100000';
      
    handleTrade(
      () => quickSell(customAmount, formattedPrice, market),
      'Market Sell',
      'sell'
    );
  };

  // Calculate estimated value
  const estimatedValue = priceData?.price && customAmount 
    ? (parseFloat(customAmount) * priceData.price) 
    : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F23" />
      <LinearGradient
        colors={['#0F0F23', '#1A1A2E']}
        style={styles.background}
      >
        {/* Status Bar - Minimal */}
        <View style={styles.statusBar}>
          <View style={styles.connectionIndicator}>
            {isPriceConnected ? (
              <Wifi size={16} color="#10B981" />
            ) : (
              <WifiOff size={16} color="#EF4444" />
            )}
          </View>
          <View style={styles.statusBarRight}>
            {!stats.isHealthy && (
              <AlertCircle size={16} color="#F59E0B" />
            )}
            <TouchableOpacity
              style={styles.positionsButton}
              onPress={() => setShowPositionsOrdersModal(true)}
            >
              <BarChart3 size={20} color="#10B981" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Error Banner */}
        {(lastError || priceError) && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>
              ⚠️ {lastError || priceError}
            </Text>
          </View>
        )}

        {/* Main Content */}
        <View style={styles.mainContent}>
                  {/* Symbol */}
        <Text style={styles.symbol}>{market}</Text>
        <Text style={styles.marketSubtitle}>Trading {getAssetSymbol(market)}</Text>
          
          {/* Price Display - Hero Section */}
          {priceData ? (
            <View style={styles.priceSection}>
              <Text style={styles.price}>{formatPrice(priceData.price)}</Text>
              <View style={[
                styles.priceChange,
                { backgroundColor: priceData.changePercent24h >= 0 ? '#10B98120' : '#EF444420' }
              ]}>
                {priceData.changePercent24h >= 0 ? (
                  <TrendingUp size={16} color="#10B981" />
                ) : (
                  <TrendingDown size={16} color="#EF4444" />
                )}
                <Text style={[
                  styles.changeText,
                  { color: priceData.changePercent24h >= 0 ? '#10B981' : '#EF4444' }
                ]}>
                  {formatPercentage(priceData.changePercent24h)}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.priceLoading}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Loading price...</Text>
            </View>
          )}

          {/* Quantity Input Section */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Trade Quantity ({getAssetSymbol(market)})</Text>
            <View style={[
              styles.quantityInputContainer,
              quantityError ? styles.quantityInputContainerError : null
            ]}>
              <TextInput
                style={styles.quantityInput}
                value={customAmount}
                onChangeText={handleQuantityChange}
                placeholder="0.0001"
                placeholderTextColor="#666"
                keyboardType="numeric"
                autoCorrect={false}
                autoCapitalize="none"
                maxLength={12}
              />
              <Text style={styles.quantityUnit}>{getAssetSymbol(market)}</Text>
            </View>
            {quantityError ? (
              <Text style={styles.errorText}>{quantityError}</Text>
            ) : (
              <Text style={styles.estimatedValue}>
                ≈ {formatPrice(estimatedValue)}
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons - Bottom */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[
              styles.actionButton, 
              styles.sellButton, 
              createShadow(shadowPresets.large),
              (isPlacingOrder || !priceData || !!quantityError) && styles.actionButtonDisabled
            ]}
            onPress={handleSell}
            disabled={isPlacingOrder || !priceData || !!quantityError}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.actionButtonText}>
                {isPlacingOrder ? 'Selling...' : 'Sell'}
              </Text>
              <Animated.Image 
                source={sellIcon} 
                style={[
                  styles.actionButtonIcon,
                  {
                    transform: [{
                      translateX: sellIconShake.interpolate({
                        inputRange: [-1, 1],
                        outputRange: [-1, 1],
                      })
                    }]
                  }
                ]} 
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton, 
              styles.buyButton, 
              createShadow(shadowPresets.large),
              (isPlacingOrder || !priceData || !!quantityError) && styles.actionButtonDisabled
            ]}
            onPress={handleBuy}
            disabled={isPlacingOrder || !priceData || !!quantityError}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.actionButtonText}>
                {isPlacingOrder ? 'Buying...' : 'Buy'}
              </Text>
              <Animated.Image 
                source={buyIcon} 
                style={[
                  styles.actionButtonIcon,
                  {
                    transform: [{
                      translateX: buyIconShake.interpolate({
                        inputRange: [-1, 1],
                        outputRange: [-1, 1],
                      })
                    }]
                  }
                ]} 
              />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Animation Overlays */}
      {showBuyAnimation && (
        <View style={styles.animationOverlay}>
          <View style={styles.animationContent}>
            <LottieView
              ref={buyAnimationRef}
              source={buyAnimation}
              style={styles.animation}
              loop={false}
              autoPlay={true}
              speed={2}
              onAnimationFinish={() => setShowBuyAnimation(false)}
            />
            <Text style={styles.animationText}>🚀 BUY ORDER</Text>
            <Text style={styles.animationSubtext}>Executing trade...</Text>
          </View>
        </View>
      )}

      {showSellAnimation && (
        <View style={styles.animationOverlay}>
          <View style={styles.animationContent}>
            <LottieView
              ref={sellAnimationRef}
              source={sellAnimation}
              style={styles.animation}
              loop={false}
              autoPlay={true}
              speed={2}
              onAnimationFinish={() => setShowSellAnimation(false)}
            />
            <Text style={styles.animationText}>💰 SELL ORDER</Text>
            <Text style={styles.animationSubtext}>Executing trade...</Text>
          </View>
        </View>
      )}

      <InsufficientBalanceModal
        visible={showInsufficientBalance}
        onClose={closeInsufficientBalanceModal}
      />

      <PositionsOrdersModal
        visible={showPositionsOrdersModal}
        onClose={() => setShowPositionsOrdersModal(false)}
        market={market}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  // Trading Screen Styles
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  connectionIndicator: {
    flex: 1,
  },
  statusBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  positionsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  symbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#B0B0B0',
    marginBottom: 8,
  },
  marketSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  priceSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  price: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  priceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  priceLoading: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loadingText: {
    color: '#B0B0B0',
    marginTop: 12,
    fontSize: 16,
  },
  tradeInfo: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
  },
  actionSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    overflow: 'visible',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  buyButton: {
    backgroundColor: '#10B981',
  },
  sellButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  actionButtonIcon: {
    width: 50,
    height: 80,
    opacity: 1,
    position: 'absolute',
    right: 20,
    top: -20,
  },
  actionButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#888',
  },
  quantitySection: {
    width: '100%',
    marginTop: 40,
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 16,
    color: '#B0B0B0',
    marginBottom: 10,
    textAlign: 'left',
    width: '100%',
    paddingHorizontal: 20,
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#333',
    width: '90%',
    marginBottom: 10,
    minHeight: 50,
  },
  quantityInputContainerError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  quantityInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    paddingVertical: 0,
    paddingHorizontal: 5,
    minWidth: 0,
  },
  quantityInputError: {
    borderColor: '#EF4444',
  },
  quantityUnit: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B0B0B0',
    marginLeft: 8,
    flexShrink: 0,
  },
  estimatedValue: {
    fontSize: 18,
    color: '#B0B0B0',
    marginTop: 10,
    textAlign: 'left',
    width: '90%',
    paddingHorizontal: 20,
  },
  // Animation Styles
  animationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 9999,
  },
  animationContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: width * 0.8,
    height: width * 0.8,
    maxWidth: 350,
    maxHeight: 350,
  },
  animationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
  },
  animationSubtext: {
    fontSize: 16,
    color: '#B0B0B0',
    marginTop: 8,
    textAlign: 'center',
  },
}); 