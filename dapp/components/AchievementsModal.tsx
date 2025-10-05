import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRewards } from '../lib/hooks/useRewards';
import { Achievement } from '../lib/api/types';

const { width, height } = Dimensions.get('window');

interface AchievementsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  visible,
  onClose
}) => {
  const {
    achievements,
    userProfile,
    loadAchievements,
    loadUserProfile
  } = useRewards();

  const [scaleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      loadAchievements();
      loadUserProfile();
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

  const getAchievementIcon = (achievement: Achievement) => {
    if (achievement.unlocked) {
      return (
        <View style={styles.unlockedIconContainer}>
          <Ionicons name="trophy" size={32} color="#FFD700" />
          <View style={styles.unlockedGlow} />
        </View>
      );
    }
    
    switch (achievement.id) {
      case 'week_warrior':
        return <Ionicons name="calendar" size={32} color="#8B5CF6" />;
      case 'galaxy_master':
        return <Ionicons name="planet" size={32} color="#00D4FF" />;
      case 'trade_master':
        return <Ionicons name="trending-up" size={32} color="#FF6B6B" />;
      default:
        return <Ionicons name="star" size={32} color="#FFD700" />;
    }
  };

  const getAchievementProgress = (achievement: Achievement) => {
    const progress = Math.min(achievement.progress, 100);
    return progress;
  };

  const renderAchievement = (achievement: Achievement) => (
    <View key={achievement.id} style={styles.achievementCard}>
      <LinearGradient
        colors={achievement.unlocked ? 
          ['#FFD700', '#FFA500', '#FF6B6B'] : 
          ['#2D3748', '#1A202C', '#0F1419']
        }
        style={styles.achievementGradient}
      >
        <View style={styles.achievementHeader}>
          <View style={styles.iconContainer}>
            {getAchievementIcon(achievement)}
          </View>
          <View style={styles.achievementInfo}>
            <Text style={[
              styles.achievementName,
              { color: achievement.unlocked ? '#FFFFFF' : '#E2E8F0' }
            ]}>
              {achievement.name}
            </Text>
            <Text style={[
              styles.achievementDescription,
              { color: achievement.unlocked ? '#F7FAFC' : '#A0AEC0' }
            ]}>
              {achievement.description}
            </Text>
          </View>
          {achievement.unlocked && (
            <View style={styles.unlockedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#00FF00" />
            </View>
          )}
        </View>
        
        {!achievement.unlocked && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={['#00D4FF', '#0099CC']}
                style={[
                  styles.progressFill,
                  { width: `${getAchievementProgress(achievement)}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>{achievement.progress}%</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );

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
            colors={['#0A0A0A', '#1A1A2E', '#16213E']}
            style={styles.modalBackground}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>SPACE ACHIEVEMENTS</Text>
              {userProfile && (
                <View style={styles.userStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>LEVEL</Text>
                    <Text style={styles.statValue}>{userProfile.level}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>XP</Text>
                    <Text style={styles.statValue}>{userProfile.experience}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>TRADES</Text>
                    <Text style={styles.statValue}>{userProfile.total_trades}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Achievements List */}
            <ScrollView style={styles.achievementsList} showsVerticalScrollIndicator={false}>
              {achievements.map(renderAchievement)}
            </ScrollView>

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
  modalContainer: {
    width: width * 0.95,
    maxHeight: height * 0.85,
    borderRadius: 25
  },
  modalBackground: {
    borderRadius: 25,
    padding: 30,
    minHeight: height * 0.6
  },
  header: {
    alignItems: 'center',
    marginBottom: 30
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00D4FF',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 212, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  statItem: {
    alignItems: 'center'
  },
  statLabel: {
    color: '#A0AEC0',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  achievementsList: {
    maxHeight: height * 0.5
  },
  achievementCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8
  },
  achievementGradient: {
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  unlockedIconContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  unlockedGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10
  },
  achievementInfo: {
    flex: 1
  },
  achievementName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6
  },
  achievementDescription: {
    fontSize: 14,
    lineHeight: 20
  },
  unlockedBadge: {
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    borderRadius: 15,
    padding: 5,
    borderWidth: 1,
    borderColor: '#00FF00'
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginRight: 15,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 4
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center'
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  closeButtonGradient: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center'
  }
}); 