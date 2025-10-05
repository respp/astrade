import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface RewardNotificationProps {
  visible: boolean;
  reward: {
    amount: number;
    type: string;
    description: string;
  } | null;
  onClose: () => void;
}

export const RewardNotification: React.FC<RewardNotificationProps> = ({
  visible,
  reward,
  onClose
}) => {
  const [slideAnim] = useState(new Animated.Value(-200));
  const [scaleAnim] = useState(new Animated.Value(0));
  const [rotateAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible && reward) {
      // Animación de entrada
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: false,
          tension: 100,
          friction: 8
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: false,
          tension: 100,
          friction: 8
        })
      ]).start();

      // Animación de rotación para NFTs
      if (reward.type.includes('nft')) {
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false
          })
        ).start();
      }

      // Auto-cerrar después de 3 segundos
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      slideAnim.setValue(-200);
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
    }
  }, [visible, reward]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 300,
        useNativeDriver: false
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      })
    ]).start(() => {
      onClose();
    });
  };

  const getRewardIcon = () => {
    if (!reward) return null;

    if (reward.type === 'mystery_nft') {
      return (
        <Animated.View
          style={{
            transform: [
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                })
              }
            ]
          }}
        >
          <Ionicons name="diamond" size={24} color="#8B5CF6" />
        </Animated.View>
      );
    }

    if (reward.type === 'premium_nft') {
      return (
        <Animated.View
          style={{
            transform: [
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                })
              }
            ]
          }}
        >
          <Ionicons name="star" size={24} color="#FFD700" />
        </Animated.View>
      );
    }

    return <Ionicons name="wallet" size={24} color="#00D4FF" />;
  };

  const getRewardBackground = (): [string, string] => {
    if (!reward) return ['#4A4A4A', '#2A2A2A'];

    if (reward.type === 'mystery_nft') {
      return ['#8B5CF6', '#A855F7'];
    }
    if (reward.type === 'premium_nft') {
      return ['#FFD700', '#FFA500'];
    }
    return ['#00D4FF', '#0099CC'];
  };

  if (!visible || !reward) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      <LinearGradient
        colors={getRewardBackground()}
        style={styles.notification}
      >
        <View style={styles.iconContainer}>
          {getRewardIcon()}
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>Reward Claimed!</Text>
          <Text style={styles.rewardName}>{reward.description}</Text>
          <Text style={styles.amount}>+{reward.amount} credits</Text>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#00D4FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  content: {
    flex: 1
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2
  },
  rewardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2
  },
  amount: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  }
}); 