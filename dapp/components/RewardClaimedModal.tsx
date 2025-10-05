import React, { useEffect, useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ClaimRewardResponse } from '../lib/api/types';

const { width, height } = Dimensions.get('window');

interface RewardClaimedModalProps {
  visible: boolean;
  reward: ClaimRewardResponse | null;
  onClose: () => void;
}

export const RewardClaimedModal: React.FC<RewardClaimedModalProps> = ({
  visible,
  reward,
  onClose
}) => {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [glowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible && reward) {
      // Animación de entrada
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: false,
          tension: 100,
          friction: 8
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: false
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: false
            })
          ])
        )
      ]).start();

      // Animación de rotación para NFTs
      if (reward.reward_data.type.includes('nft')) {
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: false
          })
        ).start();
      }
    } else {
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      glowAnim.setValue(0);
    }
  }, [visible, reward]);

  const getRewardIcon = () => {
    if (!reward) return null;

    const { type } = reward.reward_data;
    
    if (type === 'mystery_nft') {
      return (
        <Animated.View
          style={[
            styles.nftIcon,
            {
              transform: [
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }
              ]
            }
          ]}
        >
          <Ionicons name="diamond" size={48} color="#8B5CF6" />
        </Animated.View>
      );
    }

    if (type === 'premium_nft') {
      return (
        <Animated.View
          style={[
            styles.nftIcon,
            {
              transform: [
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }
              ]
            }
          ]}
        >
          <Ionicons name="star" size={48} color="#FFD700" />
        </Animated.View>
      );
    }

    return (
      <View style={styles.creditsIcon}>
        <Ionicons name="wallet" size={48} color="#00D4FF" />
        <Text style={styles.creditsAmount}>+{reward.reward_data.amount}</Text>
      </View>
    );
  };

  const getRewardBackground = (): [string, string] => {
    if (!reward) return ['#4A4A4A', '#2A2A2A'];

    const { type } = reward.reward_data;
    
    if (type === 'mystery_nft') {
      return ['#8B5CF6', '#A855F7'];
    }
    if (type === 'premium_nft') {
      return ['#FFD700', '#FFA500'];
    }
    return ['#00D4FF', '#0099CC'];
  };

  if (!reward) return null;

  return (
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
            colors={getRewardBackground()}
            style={styles.modalBackground}
          >
            <Animated.View
              style={[
                styles.glowEffect,
                {
                  opacity: glowAnim
                }
              ]}
            />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>REWARD CLAIMED!</Text>
              <Text style={styles.subtitle}>{reward.reward_data.description}</Text>
            </View>

            {/* Reward Icon */}
            <View style={styles.rewardContainer}>
              {getRewardIcon()}
            </View>

            {/* Reward Details */}
            <View style={styles.detailsContainer}>
              <Text style={styles.rewardMessage}>{reward.message}</Text>
              <Text style={styles.streakInfo}>
                New streak: {reward.new_streak} days
              </Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <LinearGradient
                colors={['#FF4757', '#FF3742']}
                style={styles.closeButtonGradient}
              >
                <Text style={styles.closeButtonText}>Great!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    width: width * 0.8,
    borderRadius: 20
  },
  modalBackground: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    position: 'relative'
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: -1
  },
  header: {
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9
  },
  rewardContainer: {
    marginBottom: 20,
    alignItems: 'center'
  },
  nftIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  creditsIcon: {
    alignItems: 'center'
  },
  creditsAmount: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8
  },
  detailsContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  rewardMessage: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10
  },
  streakInfo: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8
  },
  closeButton: {
    borderRadius: 25,
    overflow: 'hidden'
  },
  closeButtonGradient: {
    paddingHorizontal: 30,
    paddingVertical: 12
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
}); 