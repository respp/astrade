import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Award, Star, Gift, TrendingUp, Activity } from 'lucide-react-native';
import { TradingDemo } from '@/components/TradingDemo';
import PlanetVisual from '@/components/PlanetVisual';
import ProgressBar from '@/components/ProgressBar';
import ActionButton from '@/components/ActionButton';
import StatsCard from '@/components/StatsCard';
import { DailyRewardsModal } from '@/components/DailyRewardsModal';
import { AchievementsModal } from '@/components/AchievementsModal';
import { RewardsIndicator } from '@/components/RewardsIndicator';
import { AchievementNotification } from '@/components/AchievementNotification';
import { RewardNotification } from '@/components/RewardNotification';
import { useRewards } from '@/lib/hooks/useRewards';
import { useUserConfig } from '@/lib/hooks/useUserConfig';
import { useAuth } from '@/contexts/AuthContext';
import GameNavbar from '@/components/GameNavbar';
import { router } from 'expo-router';

export default function HomePlanet() {
  const [showTradingDemo, setShowTradingDemo] = useState(false);
  const [showDailyRewards, setShowDailyRewards] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showAchievementNotification, setShowAchievementNotification] = useState(false);
  const [showRewardNotification, setShowRewardNotification] = useState(false);
  const [hasShownRewardsModal, setHasShownRewardsModal] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<{
    name: string;
    description: string;
  } | null>(null);
  const [claimedReward, setClaimedReward] = useState<{
    amount: number;
    type: string;
    description: string;
  } | null>(null);

  // Usar sistema de autenticación real
  const { backendUserId, authenticated } = useAuth();
  
  // Configurar User ID en el API Client
  useUserConfig();
  
  const { 
    userProfile, 
    dailyRewardsStatus,
    achievements,
    loading
  } = useRewards();



  // Mostrar modal basado ÚNICAMENTE en la respuesta de la API
  useEffect(() => {
    if (authenticated && dailyRewardsStatus && !hasShownRewardsModal) {
      // Mostrar modal si puede reclamar O si es nuevo usuario
      if (dailyRewardsStatus.can_claim || 
          (dailyRewardsStatus.current_streak === 0 && dailyRewardsStatus.longest_streak === 0)) {
        setShowDailyRewards(true);
        setHasShownRewardsModal(true);
      }
    }
  }, [authenticated, dailyRewardsStatus]);

  // Mostrar notificación de logro desbloqueado
  useEffect(() => {
    if (achievements.length > 0) {
      const newlyUnlocked = achievements.find(achievement => achievement.unlocked);
      if (newlyUnlocked) {
        setUnlockedAchievement({
          name: newlyUnlocked.name,
          description: newlyUnlocked.description
        });
        setShowAchievementNotification(true);
      }
    }
  }, [achievements]);

  const handleOpenTrading = () => {
    console.log('Opening trading modal...');
    setShowTradingDemo(true);
  };



  const handleOpenAchievements = () => {
    setShowAchievements(true);
  };

  return (
    <LinearGradient
      colors={['#0a0a0f', '#0f0f1a', '#1a1a2e']}
      style={styles.container}
    >
      <StatusBar style="light" />
                  <GameNavbar
              onSettingsPress={() => router.push('/(tabs)/profile')}
              onNotificationsPress={() => console.log('Notifications pressed')}
              onMissionsPress={() => router.push('/(tabs)/missions')}
              onProfilePress={() => router.push('/(tabs)/profile')}
              onStreakPress={() => router.push('/(tabs)/profile?section=streak')} // Navigate to streak section
            />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome back, Space Trader!</Text>
              <Text style={styles.subtitle}>Your home planet awaits</Text>
            </View>
            <RewardsIndicator onPress={() => setShowDailyRewards(true)} />
          </View>
        </View>

        {/* Home Planet Visual */}
        <View style={styles.planetSection}>
          <PlanetVisual level={7} />
          <Text style={styles.planetName}>Terra Nova</Text>
          <Text style={styles.planetDescription}>Your Trading Headquarters</Text>
        </View>

        {/* Level Progress */}
        <View style={styles.levelSection}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelTitle}>
              Level {userProfile?.level || 1} - Space Trader
            </Text>
            <Text style={styles.xpText}>
              {userProfile?.experience || 0} XP
            </Text>
          </View>
          <ProgressBar progress={userProfile ? (userProfile.experience % 1000) / 1000 : 0} />
          <Text style={styles.nextLevel}>
            Next: Level {(userProfile?.level || 1) + 1} - Galactic Trader
          </Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsGrid}>
                      <StatsCard 
              icon={<TrendingUp size={24} color="#bf7af0" />}
              title="Total PnL"
              value={`$${userProfile?.total_pnl?.toFixed(2) || '0.00'}`}
              change={`${userProfile?.total_pnl && userProfile.total_pnl > 0 ? '+' : ''}${userProfile?.total_pnl?.toFixed(2) || '0.00'}`}
              isPositive={userProfile?.total_pnl ? userProfile.total_pnl > 0 : false}
            />
            <StatsCard 
              icon={<Star size={24} color="#bf7af0" />}
              title="Total XP"
              value={userProfile?.experience?.toString() || '0'}
              change={`${userProfile?.total_trades || 0} trades`}
              isPositive={true}
            />
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <ActionButton 
              icon={<Award size={24} color="#FFFFFF" />}
              title="Daily Rewards"
              subtitle="Claim your rewards"
              gradient={['#bf7af0', '#8b5cf6']}
                              onPress={() => setShowDailyRewards(true)}
            />
            <ActionButton 
              icon={<Star size={24} color="#FFFFFF" />}
              title="Achievements"
              subtitle="View progress"
              gradient={['#bf7af0', '#8b5cf6']}
              onPress={handleOpenAchievements}
            />
            <ActionButton 
              icon={<Gift size={24} color="#FFFFFF" />}
              title="NFT Collection"
              subtitle="Manage assets"
              gradient={['#bf7af0', '#8b5cf6']}
            />
            <ActionButton 
              icon={<Activity size={24} color="#FFFFFF" />}
              title="Quick Trade"
              subtitle="Execute trades"
              gradient={['#bf7af0', '#8b5cf6']}
              onPress={handleOpenTrading}
            />
          </View>
        </View>



        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Star size={16} color="#bf7af0" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Mission Completed</Text>
                <Text style={styles.activitySubtitle}>Daily Trading Challenge</Text>
              </View>
              <Text style={styles.activityReward}>+50 XP</Text>
            </View>
            
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <TrendingUp size={16} color="#bf7af0" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Trade Executed</Text>
                <Text style={styles.activitySubtitle}>Bought ETH on Mars</Text>
              </View>
              <Text style={styles.activityProfit}>+$124</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Quick Trade Modal */}
      <Modal
        visible={showTradingDemo}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowTradingDemo(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowTradingDemo(false)}
          >
            <Text style={styles.closeText}>✕ Close</Text>
          </TouchableOpacity>
          <TradingDemo />
        </View>
      </Modal>

      {/* Daily Rewards Modal */}
      <DailyRewardsModal
        visible={showDailyRewards}
        onClose={() => {
          setShowDailyRewards(false);
          // Resetear el estado para permitir que se abra automáticamente la próxima vez
          // solo si el usuario no puede reclamar (para evitar spam)
          if (!dailyRewardsStatus?.can_claim) {
            setHasShownRewardsModal(false);
          }
        }}
        onRewardClaimed={(reward) => {
          setClaimedReward(reward);
          setShowRewardNotification(true);
          // Resetear el estado después de reclamar para permitir futuras aperturas automáticas
          setHasShownRewardsModal(false);
        }}
      />

      {/* Achievements Modal */}
      <AchievementsModal
        visible={showAchievements}
        onClose={() => setShowAchievements(false)}
      />

      {/* Achievement Notification */}
      <AchievementNotification
        visible={showAchievementNotification}
        achievement={unlockedAchievement}
        onClose={() => {
          setShowAchievementNotification(false);
          setUnlockedAchievement(null);
        }}
      />

      {/* Reward Notification */}
      <RewardNotification
        visible={showRewardNotification}
        reward={claimedReward}
        onClose={() => {
          setShowRewardNotification(false);
          setClaimedReward(null);
        }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 100, // Adjusted for centered navbar height
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#bf7af0',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  planetSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  planetName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#bf7af0',
    marginTop: 15,
  },
  planetDescription: {
    fontSize: 14,
    color: '#a0a0a0',
    marginTop: 4,
  },
  levelSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#bf7af0',
  },
  xpText: {
    fontSize: 14,
    color: '#bf7af0',
    fontWeight: '600',
  },
  nextLevel: {
    fontSize: 12,
    color: '#a0a0a0',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 30,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#bf7af0',
    marginBottom: 15,
  },
  actionButtons: {
    gap: 12,
  },
  activitySection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(191, 122, 240, 0.1)',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.3)',
    shadowColor: '#bf7af0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(191, 122, 240, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.4)',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#a0a0a0',
    marginTop: 2,
  },
  activityReward: {
    fontSize: 14,
    fontWeight: '600',
    color: '#bf7af0',
  },
  activityProfit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#bf7af0',
  },

  modalContainer: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(191, 122, 240, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.3)',
  },
  closeText: {
    color: '#bf7af0',
    fontSize: 14,
    fontWeight: 'bold',
  },
});