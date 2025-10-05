import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRewards } from '../lib/hooks/useRewards';
import { useAuth } from '../contexts/AuthContext';
import { DailyReward, ClaimRewardResponse } from '../lib/api/types';
import { RewardClaimedModal } from './RewardClaimedModal';
import { RewardRevealAnimation } from './RewardRevealAnimation';
import { SpaceBorder } from './SpaceBorder';

const { width, height } = Dimensions.get('window');

interface DailyRewardsModalProps {
  visible: boolean;
  onClose: () => void;
  onRewardClaimed?: (reward: {
    amount: number;
    type: string;
    description: string;
  }) => void;
}

// Componente para borde unificado (NFT con gradiente, Coin transparente)
const UnifiedBorder: React.FC<{ children: React.ReactNode; isNFT: boolean }> = ({ children, isNFT }) => {
  const borderColors = isNFT 
    ? [
        'rgb(0, 150, 255)',      // Azul cián brillante (como el logo)
        'rgb(100, 50, 255)',     // Azul púrpura intenso
        'rgb(200, 50, 200)',     // Magenta vibrante
        'rgb(255, 100, 180)',    // Rosa fucsia brillante
        'rgb(255, 50, 150)'      // Rosa intenso final
      ] as const
    : [
        'rgba(139, 92, 246, 0.3)',
        'rgba(139, 92, 246, 0.2)',
        'rgba(139, 92, 246, 0.1)',
        'rgba(139, 92, 246, 0.2)',
        'rgba(139, 92, 246, 0.3)'
      ] as const;

  return (
    <View style={styles.unifiedBorderContainer}>
      <LinearGradient
        colors={borderColors}
        style={styles.unifiedGradientBorder}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {children}
      </LinearGradient>
    </View>
  );
};



// Componente de contador de tiempo
const TimeCounter: React.FC<{ timeString: string | null | undefined }> = ({ timeString }) => {
  const [timeLeft, setTimeLeft] = useState<string>(timeString || 'Available!');
  const intervalRef = useRef<number | null>(null);
  const componentId = useRef(Math.random().toString(36).slice(2));
  
  // HOOK CALLS MUST BE AT TOP LEVEL
  const { backendUserId } = useAuth();
  const storageKey = `dailyRewardsTimer_${backendUserId || 'anonymous'}`;



  useEffect(() => {
    // Función para parsear diferentes formatos de tiempo
    const parseTimeString = (timeStr: string | null | undefined): number => {
      
      // Verificar si timeStr es válido
      if (!timeStr || typeof timeStr !== 'string') {
        return 0;
      }
      
      // Si es un formato simple como "1d", "2h", "30m"
      if (timeStr.includes('d')) {
        const days = parseInt(timeStr.replace('d', ''));
        // En lugar de usar exactamente 24 horas, vamos a calcular el tiempo hasta las 00:00 del día siguiente
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + days);
        tomorrow.setHours(0, 0, 0, 0); // Medianoche del día correspondiente
        
        const result = tomorrow.getTime() - now.getTime();
        return Math.max(0, result);
      }
      if (timeStr.includes('h')) {
        const hours = parseInt(timeStr.replace('h', ''));
        return hours * 60 * 60 * 1000; // hours to milliseconds
      }
      if (timeStr.includes('m')) {
        const minutes = parseInt(timeStr.replace('m', ''));
        return minutes * 60 * 1000; // minutes to milliseconds
      }
      if (timeStr.includes('s')) {
        const seconds = parseInt(timeStr.replace('s', ''));
        return seconds * 1000; // seconds to milliseconds
      }
      
      // If it's an ISO format or timestamp
      if (timeStr.includes('T') || timeStr.includes('-')) {
        const targetTime = new Date(timeStr).getTime();
        const now = new Date().getTime();
        return Math.max(0, targetTime - now);
      }
      
      // If it's a number (timestamp in seconds)
      const timestamp = parseInt(timeStr);
      if (!isNaN(timestamp)) {
        const targetTime = timestamp * 1000; // convertir a milisegundos
        const now = new Date().getTime();
        return Math.max(0, targetTime - now);
      }
      
      return 0;
    };

            // Function to format remaining time
    const formatTimeLeft = (milliseconds: number): string => {
      if (milliseconds <= 0) return 'Available!';
      
      const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000));
      const hours = Math.floor((milliseconds % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);
      
      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      } else {
        return `${seconds}s`;
      }
    };

    const loadSavedData = async () => {
      try {
        const savedData = await AsyncStorage.getItem(storageKey);
        if (__DEV__) {
          console.log(`💾 Timer ${componentId.current} AsyncStorage:`, {
            hasData: !!savedData,
            storageKey,
            userId: backendUserId?.slice(-8) // Solo últimos 8 caracteres por privacidad
          });
        }
        let initialTime: number;
        let startTime: number;
        
        if (savedData) {
          const { savedInitialTime, savedStartTime, savedTimeString } = JSON.parse(savedData);
          
          // SOLUCIÓN: Solo usar datos guardados si el timeString NO cambió significativamente
          // Esto evita que el timer se reinicie cuando el backend actualiza el estado
          const timeStringChanged = savedTimeString !== timeString;
          
          if (!timeStringChanged && savedInitialTime > 0) {
            initialTime = savedInitialTime;
            startTime = savedStartTime;
          } else {
            // Calcular nuevo tiempo solo si es necesario
            const newInitialTime = parseTimeString(timeString);
            
            initialTime = newInitialTime;
            startTime = Date.now();
            
            // Guardar nuevos datos
            const dataToSave = {
              savedInitialTime: initialTime,
              savedStartTime: startTime,
              savedTimeString: timeString
            };
            if (__DEV__) {
              console.log(`💾 Timer ${componentId.current} saving new data`);
            }
            await AsyncStorage.setItem(storageKey, JSON.stringify(dataToSave));
          }
        } else {
          // No hay datos guardados, calcular nuevo
          const newInitialTime = parseTimeString(timeString);
          
          if (__DEV__) {
            console.log(`🆕 Timer ${componentId.current} initial setup`);
          }
          
          initialTime = newInitialTime;
          startTime = Date.now();
          
          // Guardar datos iniciales
          const dataToSave = {
            savedInitialTime: initialTime,
            savedStartTime: startTime,
            savedTimeString: timeString
          };
          await AsyncStorage.setItem(storageKey, JSON.stringify(dataToSave));
        }
        
        // Continue with timer logic
        startTimer(initialTime, startTime);
      } catch (error) {
        console.error('Error loading timer data:', error);
        // Fallback without persistence
        const initialTime = parseTimeString(timeString);
        const startTime = Date.now();
        startTimer(initialTime, startTime);
      }
    };

    const startTimer = (initialTime: number, startTime: number) => {
      // Limpiar timer anterior si existe
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }


      
      // Si no hay tiempo restante, mostrar "Available!"
      if (initialTime <= 0) {
        setTimeLeft('Available!');
        return;
      }

      // Actualizar cada segundo
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = initialTime - elapsed;
        const newTimeLeft = formatTimeLeft(remaining);
        
        setTimeLeft(newTimeLeft);
        
        if (remaining <= 0) {
          setTimeLeft('Available!');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          // Limpiar AsyncStorage cuando el tiempo se agota
          AsyncStorage.removeItem(storageKey).catch(console.error);
        }
      }, 1000);
    };

    loadSavedData();

    // Cleanup function to clear timer when component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timeString, storageKey, backendUserId]);

  return (
    <View style={styles.timerBox}>
      <Ionicons name="time" size={16} color="#FFFFFF" />
      <Text style={styles.timerText}>{timeLeft}</Text>
    </View>
  );
};

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  visible,
  onClose,
  onRewardClaimed
}) => {
  const {
    dailyRewardsStatus,
    claimDailyReward,
    loading,
    error,
    loadDailyRewardsStatus
  } = useRewards();



  const [scaleAnim] = useState(new Animated.Value(0));
  const [rewardAnim] = useState(new Animated.Value(0));
  const [claimedReward, setClaimedReward] = useState<ClaimRewardResponse | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showRevealAnimation, setShowRevealAnimation] = useState(false);
  const [isFirstReward, setIsFirstReward] = useState(false);

  useEffect(() => {
    if (visible) {
      loadDailyRewardsStatus();
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: false,
        tension: 100,
        friction: 8
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const handleClaimReward = async () => {
    if (!dailyRewardsStatus?.can_claim) return;

    const result = await claimDailyReward('daily_streak');
    if (result) {
              // Check if it's the first reward (streak = 0 before claiming)
      const isFirst = dailyRewardsStatus.current_streak === 0;
      setIsFirstReward(isFirst);
      
              // Save claimed reward
      setClaimedReward(result);
      
      if (isFirst) {
        // Show reveal animation for first reward
        setShowRevealAnimation(true);
      } else {
        // Normal animation for subsequent rewards
        Animated.sequence([
          Animated.timing(rewardAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false
          }),
          Animated.timing(rewardAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false
          })
        ]).start();

        setShowRewardModal(true);
      }

              // Notify parent component about claimed reward
      if (onRewardClaimed && claimedReward) {
        onRewardClaimed({
          amount: claimedReward.reward_data.amount,
          type: claimedReward.reward_data.type,
          description: claimedReward.reward_data.description
        });
      }
      
      // Recargar el estado después de reclamar
      setTimeout(() => {
        loadDailyRewardsStatus();
      }, 1000);
    }
  };

  const handleRewardModalClose = () => {
    setShowRewardModal(false);
    setClaimedReward(null);
    onClose();
  };

  const handleRevealAnimationClose = () => {
    setShowRevealAnimation(false);
            // After closing reveal animation, show normal modal
    setShowRewardModal(true);
  };

  const getRewardContent = (day: number, isClaimed: boolean, isToday: boolean, isLocked: boolean, rewardType?: string, imageUrl?: string) => {
    // URL base para las imágenes
    const BASE_URL = __DEV__ ? 'http://localhost:8000' : 'https://tu-api.com';
    
            // For days 1, 3 and 5 use coin_bg_space.png
    if (day === 1 || day === 3 || day === 5) {
      return (
        <View style={styles.rewardImageContainer}>
          <Image 
            source={require('../assets/images/coin_bg_space.png')}
            style={[
              styles.rewardImage,
              isClaimed && styles.claimedRewardImage // Blurred style for claimed rewards
            ]}
            resizeMode="contain"
          />
          {isClaimed && (
            <View style={styles.claimedOverlay}>
              <Ionicons name="checkmark-circle" size={32} color="#00D4FF" />
            </View>
          )}
          {isLocked && !isClaimed && (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
            </View>
          )}
        </View>
      );
    }
    
    if (isClaimed) {
      return <Ionicons name="checkmark-circle" size={32} color="#00D4FF" />;
    }
    
    if (isToday && !isLocked) {
      return <Ionicons name="gift" size={32} color="#FFD700" />;
    } else if (imageUrl) {
              // Show reward image whenever available
      const fullImageUrl = `${BASE_URL}${imageUrl}`;
      return (
        <View style={styles.rewardImageContainer}>
          <Image 
            source={{ uri: fullImageUrl }}
            style={styles.rewardImage}
            resizeMode="contain"
          />
          {isLocked && (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
            </View>
          )}
        </View>
      );
    } else {
      // Fallback a iconos si no hay imagen
      const type = rewardType;
      let iconContent;
      if (type === 'mystery_nft' || type === 'mystery_card') {
        iconContent = <Ionicons name="help-circle" size={32} color="#8B5CF6" />;
      } else if (type === 'premium_mystery_variant') {
        iconContent = <Ionicons name="diamond" size={32} color="#FFD700" />;
      } else {
        iconContent = <Ionicons name="star" size={32} color="#FFD700" />;
      }
      
      return (
        <View style={styles.rewardImageContainer}>
          {iconContent}
          {isLocked && (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
            </View>
          )}
        </View>
      );
    }
  };

  const getRewardBackground = (day: number, isClaimed: boolean, isToday: boolean, isLocked: boolean): [string, string] => {
    // Unificar todos los colores de fondo para que tengan el mismo borde sólido interior
    if (isToday && !isLocked) {
      return ['#FFD700', '#FFA500'];
    } else if (isLocked) {
      return ['#4A5568', '#2D3748'];
    } else {
      return ['#2D3748', '#1A202C'];
    }
  };

  const renderRewardCard = (reward: DailyReward) => {
    const day = reward.day;
    const isClaimed = reward.is_claimed;
    const isToday = reward.is_today;
    const isLocked = reward.is_locked;
    const rewardType = reward.reward?.type;
    const amount = reward.amount || reward.reward?.amount;
    const [gradientStart, gradientEnd] = getRewardBackground(day, isClaimed, isToday, isLocked);

    // Determinar si es NFT para usar borde con gradiente
    const isNFT = day === 2 || day === 4 || day === 6;

    return (
      <View key={day} style={styles.rewardCard}>
        <Text style={styles.dayNumber}>Day {day}</Text>
        {!isClaimed ? (
          // Usar borde unificado para todos (NFTs con gradiente, coins transparentes)
          <UnifiedBorder isNFT={isNFT}>
            <LinearGradient
              colors={[gradientStart, gradientEnd]}
              style={styles.unifiedInnerContainer}
            >
              {getRewardContent(day, isClaimed, isToday, isLocked, rewardType, reward.reward?.image_url)}
            </LinearGradient>
          </UnifiedBorder>
        ) : (
          // For claimed rewards, use normal container without shimmering border
          <LinearGradient
            colors={[gradientStart, gradientEnd]}
            style={styles.hexagonContainer}
          >
            {getRewardContent(day, isClaimed, isToday, isLocked, rewardType, reward.reward?.image_url)}
          </LinearGradient>
        )}
        {amount && (
          <Text style={styles.amountText}>{amount}</Text>
        )}
      </View>
    );
  };

    const renderPremiumReward = () => {
            // Find day 7 reward in backend data
    const day7Reward = dailyRewardsStatus?.week_rewards.find(r => r.day === 7);
    const amount = day7Reward?.amount || day7Reward?.reward?.amount || 500;
    const type = day7Reward?.reward?.type || 'premium_mystery_variant';
    
    return (
      <View style={styles.premiumRewardContainer}>
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          style={styles.premiumReward}
        >
          <View style={styles.premiumContent}>
            <View style={styles.premiumText}>
              <Text style={styles.premiumDay}>Day 7</Text>
              <Text style={styles.premiumDescription}>
                {type === 'premium_mystery_variant' ? 'Mysterious Premium NFT' : 'Premium Reward'}
              </Text>
              <Text style={styles.premiumAmount}>{amount} credits</Text>
            </View>
            <View style={styles.premiumIcon}>
              <Ionicons name="diamond" size={32} color="#FFFFFF" />
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  if (!dailyRewardsStatus) {
    return null;
  }

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <LinearGradient
              colors={['#0A0A0A', '#1A1A2E', '#16213E']}
              style={styles.modalBackground}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>DAILY REWARDS</Text>
                <Text style={styles.subtitle}>25/7/2025 - 2/8/2025</Text>
                

                
                <View style={styles.timerContainer}>
                  <Text style={styles.timerLabel}>Next reward in:</Text>
                  <TimeCounter timeString={dailyRewardsStatus?.next_reward_in} />
                </View>
              </View>

              {/* Rewards Grid */}
              <View style={styles.rewardsGrid}>
                {dailyRewardsStatus.week_rewards.slice(0, 6).map(renderRewardCard)}
              </View>

              {/* Premium Reward */}
              {renderPremiumReward()}

              {/* Claim Button */}
              {dailyRewardsStatus.can_claim && (
                <TouchableOpacity
                  style={styles.claimButton}
                  onPress={handleClaimReward}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#FF4757', '#FF3742']}
                    style={styles.claimButtonGradient}
                  >
                    <Text style={styles.claimButtonText}>
                      {loading ? 'Claiming...' : 'Claim Reward!'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Close Button */}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <LinearGradient
                  colors={['#FF4757', '#FF3742']}
                  style={styles.closeButtonGradient}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>

      {/* Claimed reward modal */}
      <RewardClaimedModal
        visible={showRewardModal}
        reward={claimedReward}
        onClose={handleRewardModalClose}
      />

      {/* Reveal animation for first reward */}
      <RewardRevealAnimation
        visible={showRevealAnimation}
        reward={claimedReward ? {
          amount: claimedReward.reward_data.amount,
          type: claimedReward.reward_data.type,
          description: claimedReward.reward_data.description
        } : null}
        onClose={handleRevealAnimationClose}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10 // Reduced from 20
  },
  modalContainer: {
    width: width * 0.95,
    maxHeight: height * 0.85, // Reduced from 0.9
    borderRadius: 20 // Reduced from 25
  },
  modalBackground: {
    borderRadius: 20, // Reduced from 25
    padding: 20, // Reduced from 30
    alignItems: 'center',
    minHeight: height * 0.6 // Reduced from 0.7
  },
  header: {
    alignItems: 'center',
    marginBottom: 25, // Reduced from 40
    width: '100%'
  },
  title: {
    fontSize: 22, // Reduced from 24
    fontWeight: 'bold',
    color: '#00D4FF',
    textAlign: 'center',
    marginBottom: 8, // Reduced from 10
    textShadowColor: 'rgba(0, 212, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10
  },
  subtitle: {
    fontSize: 14, // Reduced from 16
    color: '#00D4FF',
    marginBottom: 15, // Reduced from 20
    opacity: 0.8
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // Reduced from 10
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    paddingHorizontal: 12, // Reduced from 15
    paddingVertical: 6, // Reduced from 8
    borderRadius: 15 // Reduced from 20
  },
  timerLabel: {
    color: '#FFFFFF',
    fontSize: 12, // Reduced from 14
    marginRight: 8 // Reduced from 10
  },
  timerBox: {
    backgroundColor: '#FF4757',
    borderRadius: 10, // Reduced from 12
    paddingHorizontal: 12, // Reduced from 15
    paddingVertical: 6, // Reduced from 8
    flexDirection: 'row',
    alignItems: 'center'
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 12, // Reduced from 14
    fontWeight: 'bold',
    marginLeft: 4 // Reduced from 6
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 25, // Reduced from 40
    width: '100%'
  },
  rewardCard: {
    alignItems: 'center',
    margin: 8, // Reduced from 12
    width: 80 // Reduced from 100
  },
  dayNumber: {
    color: '#FFFFFF',
    fontSize: 14, // Reduced from 16
    fontWeight: 'bold',
    marginBottom: 8, // Reduced from 10
    textAlign: 'center'
  },
  hexagonContainer: {
    width: 80, // Reduced from 100
    height: 80, // Reduced from 100
    borderRadius: 8, // Reduced from 10
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden'
  },
  rewardImage: {
    width: 70, // Reduced from 85
    height: 70, // Reduced from 85
    borderRadius: 0
  },
  rewardImageContainer: {
    position: 'relative',
    width: 70, // Reduced from 85
    height: 70, // Reduced from 85
    borderRadius: 0,
    overflow: 'visible',
    justifyContent: 'center',
    alignItems: 'center'
  },
  lockOverlay: {
    position: 'absolute',
    top: -3, // Reduced from -5
    right: -3, // Reduced from -5
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 10, // Reduced from 12
    width: 20, // Reduced from 24
    height: 20, // Reduced from 24
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5
  },
  claimedRewardImage: {
    opacity: 0.3,
    filter: 'blur(2px)'
  },
  claimedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8 // Reduced from 10
  },
  unifiedBorderContainer: {
    width: 80, // Reduced from 100
    height: 80, // Reduced from 100
    padding: 2, // Reduced from 3
  },
  unifiedGradientBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 8, // Reduced from 10
    padding: 2, // Reduced from 3
    justifyContent: 'center',
    alignItems: 'center',
  },
  unifiedInnerContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 6, // Reduced from 7
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden'
  },
  claimedIcon: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  lockedIcon: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  todayIcon: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  amountText: {
    color: '#FFFFFF',
    fontSize: 12, // Reduced from 14
    fontWeight: 'bold',
    marginTop: 6, // Reduced from 8
    textAlign: 'center'
  },
  premiumRewardContainer: {
    marginBottom: 20, // Reduced from 30
    width: '100%'
  },
  premiumReward: {
    borderRadius: 15, // Reduced from 20
    padding: 20, // Reduced from 25
    borderWidth: 2, // Reduced from 3
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12, // Reduced from 15
    elevation: 8 // Reduced from 10
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  premiumText: {
    flex: 1
  },
  premiumDay: {
    fontSize: 20, // Reduced from 24
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4, // Reduced from 6
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4 // Reduced from 5
  },
  premiumDescription: {
    fontSize: 14, // Reduced from 16
    color: '#FFFFFF',
    fontStyle: 'italic',
    opacity: 0.9
  },
  premiumAmount: {
    fontSize: 12, // Reduced from 14
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 3, // Reduced from 4
    opacity: 0.8
  },
  premiumIcon: {
    width: 60, // Reduced from 70
    height: 60, // Reduced from 70
    borderRadius: 30, // Reduced from 35
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, // Reduced from 4
    shadowOpacity: 0.3,
    shadowRadius: 6, // Reduced from 8
    elevation: 6 // Reduced from 8
  },
  claimButton: {
    marginBottom: 15, // Reduced from 20
    borderRadius: 25, // Reduced from 30
    overflow: 'hidden',
    width: '100%',
    shadowColor: '#FF4757',
    shadowOffset: { width: 0, height: 3 }, // Reduced from 4
    shadowOpacity: 0.3,
    shadowRadius: 6, // Reduced from 8
    elevation: 6 // Reduced from 8
  },
  claimButtonGradient: {
    paddingHorizontal: 30, // Reduced from 40
    paddingVertical: 15 // Reduced from 18
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 16, // Reduced from 18
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  closeButton: {
    position: 'absolute',
    top: 15, // Reduced from 20
    right: 15, // Reduced from 20
    borderRadius: 20, // Reduced from 25
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  closeButtonGradient: {
    width: 40, // Reduced from 50
    height: 40, // Reduced from 50
    justifyContent: 'center',
    alignItems: 'center'
  }
}); 