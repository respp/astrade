import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

interface RewardRevealAnimationProps {
  visible: boolean;
  reward: {
    amount: number;
    type: string;
    description: string;
  } | null;
  onClose: () => void;
}

export const RewardRevealAnimation: React.FC<RewardRevealAnimationProps> = ({
  visible,
  reward,
  onClose
}) => {
  const [animationStep, setAnimationStep] = useState(0);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible && reward) {
      startAnimation();
    } else {
      resetAnimation();
    }
  }, [visible, reward]);

  const startAnimation = () => {
    setAnimationStep(0);
    
    // Paso 1: Aparece el overlay con fade in
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false
    }).start(() => {
      setAnimationStep(1);
      
      // Paso 2: Aparece el contenedor principal con scale
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: false
      }).start(() => {
        setAnimationStep(2);
        
        // Paso 3: Inicia la animación Lottie
        if (lottieRef.current) {
          lottieRef.current.play();
        }
        
        // Paso 4: Rotación y glow después de 1 segundo
        setTimeout(() => {
          setAnimationStep(3);
          Animated.parallel([
            Animated.timing(rotationAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: false
            }),
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: false
            })
          ]).start(() => {
            setAnimationStep(4);
          });
        }, 1000);
      });
    });
  };

  const resetAnimation = () => {
    scaleAnim.setValue(0);
    opacityAnim.setValue(0);
    rotationAnim.setValue(0);
    glowAnim.setValue(0);
    setAnimationStep(0);
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'credits':
        return <Ionicons name="star" size={60} color="#FFD700" />;
      case 'mystery_nft':
      case 'mystery_card':
        return <Ionicons name="help-circle" size={60} color="#8B5CF6" />;
      case 'premium_mystery_variant':
        return <Ionicons name="diamond" size={60} color="#FFD700" />;
      default:
        return <Ionicons name="gift" size={60} color="#FFD700" />;
    }
  };

  const getRewardBackground = (type: string): [string, string] => {
    switch (type) {
      case 'credits':
        return ['#FFD700', '#FFA500'];
      case 'mystery_nft':
      case 'mystery_card':
        return ['#8B5CF6', '#6D28D9'];
      case 'premium_mystery_variant':
        return ['#FFD700', '#FF6B6B'];
      default:
        return ['#00D4FF', '#0099CC'];
    }
  };

  if (!visible || !reward) return null;

  const [gradientStart, gradientEnd] = getRewardBackground(reward.type);
  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8]
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['#0A0A0A', '#1A1A2E', '#16213E']}
            style={styles.background}
          >
            {/* Animación Lottie de fondo */}
            <View style={styles.lottieContainer}>
              <LottieView
                ref={lottieRef}
                source={require('../assets/images/animations/buy.json')}
                style={styles.lottieAnimation}
                loop={false}
                autoPlay={false}
              />
            </View>

            {/* Contenido principal */}
            <View style={styles.content}>
              <Text style={styles.title}>REWARD UNLOCKED!</Text>
              
              <Animated.View
                style={[
                  styles.rewardContainer,
                  {
                    transform: [{ rotate: rotation }]
                  }
                ]}
              >
                <LinearGradient
                  colors={[gradientStart, gradientEnd]}
                  style={styles.rewardCircle}
                >
                  {getRewardIcon(reward.type)}
                </LinearGradient>
                
                <Animated.View
                  style={[
                    styles.glowEffect,
                    {
                      opacity: glowOpacity,
                      backgroundColor: gradientStart
                    }
                  ]}
                />
              </Animated.View>

              <Text style={styles.rewardAmount}>
                {reward.amount} {reward.type === 'credits' ? 'Credits' : 'Reward'}
              </Text>
              
              <Text style={styles.rewardDescription}>
                {reward.description}
              </Text>

              {animationStep >= 4 && (
                <TouchableOpacity
                  style={styles.claimButton}
                  onPress={onClose}
                >
                  <LinearGradient
                    colors={['#FF4757', '#FF3742']}
                    style={styles.claimButtonGradient}
                  >
                    <Text style={styles.claimButtonText}>COLLECT REWARD</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  container: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 25
  },
  background: {
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    minHeight: height * 0.6,
    position: 'relative',
    overflow: 'hidden'
  },
  lottieContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3
  },
  lottieAnimation: {
    width: '100%',
    height: '100%'
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
    width: '100%'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 40,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15
  },
  rewardContainer: {
    position: 'relative',
    marginBottom: 30
  },
  rewardCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12
  },
  glowEffect: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 80,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15
  },
  rewardAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  rewardDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24
  },
  claimButton: {
    width: '100%',
    marginTop: 20
  },
  claimButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center'
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  }
}); 