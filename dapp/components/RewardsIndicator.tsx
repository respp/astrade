import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  View,
  Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRewards } from '../lib/hooks/useRewards';
import { createPulseAnimation } from '../lib/animation-utils';

const { width } = Dimensions.get('window');

interface RewardsIndicatorProps {
  onPress: () => void;
}

export const RewardsIndicator: React.FC<RewardsIndicatorProps> = ({ onPress }) => {
  const { dailyRewardsStatus, loading, error } = useRewards(); // Removed redundant loadDailyRewardsStatus
  const [pulseAnim] = useState(new Animated.Value(1));



  // No need to call loadDailyRewardsStatus here - useRewards handles it automatically

  useEffect(() => {
    if (dailyRewardsStatus?.can_claim) {
      // Pulse animation when reward is available
      createPulseAnimation(pulseAnim).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [dailyRewardsStatus?.can_claim]);

  if (!dailyRewardsStatus) {
    return null;
  }

  const handlePress = () => {
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.indicator,
          {
            transform: [{ scale: pulseAnim }]
          }
        ]}
      >
        <LinearGradient
          colors={dailyRewardsStatus.can_claim ? ['#10B981', '#059669'] : ['#6B7280', '#4B5563']}
          style={styles.gradient}
        >
          <Ionicons 
            name="gift" 
            size={20} 
            color="#FFFFFF" 
          />
          {dailyRewardsStatus.can_claim && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>!</Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 10
  },
  indicator: {
    position: 'relative'
  },
  gradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: 'bold'
  },
  claimText: {
    color: '#FF4757',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4
  }
}); 