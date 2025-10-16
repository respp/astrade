import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { User, Wallet, Settings, CreditCard, Shield, Trophy, Star, TrendingUp, LogOut, Zap, Target, Rocket, Satellite, ArrowRight } from 'lucide-react-native';
import Avatar from '@/components/Avatar';
import StatItem from '@/components/StatItem';
import SettingsItem from '@/components/SettingsItem';
import ScreenWrapper from '@/components/ScreenWrapper';
// import AtomiqWithdrawal from '@/components/AtomiqWithdrawal'; // TODO: Create this component
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { useRewards } from '@/lib/hooks/useRewards';
import { router, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

export default function ProfileAndFinances() {
  const { signOut, userId, authenticated } = useAuth();
  const { wallet, isAuthenticated: walletAuthenticated } = useWallet();
  const { userProfile, streakInfo } = useRewards();
  const { section } = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  const streakSectionRef = useRef<View>(null);
  const [showAtomiqWithdrawal, setShowAtomiqWithdrawal] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'This will sign you out from both your wallet and trading account. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Format user ID for display (show first 8 and last 4 characters)
  const formatUserId = (id: string) => {
    if (id.length < 12) return id;
    return `${id.slice(0, 8)}...${id.slice(-4)}`;
  };

  // Format wallet address for display
  const formatAddress = (address: string) => {
    if (address.length < 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const walletInfo = wallet?.getWalletInfo();

  // Handle navigation to specific sections
  useEffect(() => {
    if (section === 'streak' && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 600, animated: true });
      }, 800);
    }
  }, [section]);

  // Mock achievements data
  const achievements = [
    { id: 1, name: 'First Light', description: 'Complete your first trade', icon: '⭐', unlocked: true },
    { id: 2, name: 'Stellar Navigator', description: 'Trade in 5 different sectors', icon: '🧭', unlocked: true },
    { id: 3, name: 'Cosmic Explorer', description: 'Maintain 7-day streak', icon: '🚀', unlocked: true },
    { id: 4, name: 'Galaxy Master', description: 'Reach 1000 XP points', icon: '🌌', unlocked: false },
    { id: 5, name: 'Quantum Trader', description: 'Win 50 consecutive trades', icon: '⚡', unlocked: false },
  ];

  return (
    <LinearGradient
      colors={['#0a0a0f', '#0f0f1a', '#1a1a2e']}
      style={styles.container}
    >
      <StatusBar style="light" />
      <ScreenWrapper>
        <ScrollView ref={scrollViewRef} style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Hero Profile Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroContainer}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  <Avatar level={7} />
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>7</Text>
                  </View>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.userName}>Commander Alex</Text>
                  <Text style={styles.userTitle}>Cosmic Explorer • Sector Alpha</Text>
                  <View style={styles.statusIndicator}>
                    <View style={[styles.statusDot, { backgroundColor: authenticated && walletAuthenticated ? '#bf7af0' : '#ff6b6b' }]} />
                    <Text style={styles.statusText}>
                      {authenticated && walletAuthenticated ? 'Mission Ready' : 'Systems Offline'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Stats Cards */}
          <View style={styles.quickStatsContainer}>
            <View style={styles.quickStatsRow}>
              <View style={styles.quickStatCard}>
                <View style={styles.quickStatContent}>
                  <TrendingUp size={24} color="#bf7af0" />
                  <Text style={styles.quickStatValue}>$12,450</Text>
                  <Text style={styles.quickStatLabel}>Total PnL</Text>
                  <Text style={styles.quickStatChange}>+24.5%</Text>
                </View>
              </View>
              <View style={styles.quickStatCard}>
                <View style={styles.quickStatContent}>
                  <Trophy size={24} color="#bf7af0" />
                  <Text style={styles.quickStatValue}>89%</Text>
                  <Text style={styles.quickStatLabel}>Win Rate</Text>
                  <Text style={styles.quickStatChange}>+2.1%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Connection Status */}
          <View style={styles.connectionSection}>
            <Text style={styles.sectionTitle}>System Status</Text>
            <View style={styles.connectionGrid}>
              <TouchableOpacity style={[styles.connectionCard, walletAuthenticated ? styles.connectedCard : styles.disconnectedCard]}>
                <View style={styles.connectionIcon}>
                  <Wallet size={24} color={walletAuthenticated ? '#bf7af0' : '#ff6b6b'} />
                  {walletAuthenticated && <View style={styles.connectionPulse} />}
                </View>
                <Text style={styles.connectionTitle}>Cavos Wallet</Text>
                <Text style={styles.connectionStatus}>
                  {walletAuthenticated ? 'Online' : 'Offline'}
                </Text>
                {walletInfo && (
                  <Text style={styles.connectionDetail}>
                    {formatAddress(walletInfo.address)}
                  </Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.connectionCard, authenticated ? styles.connectedCard : styles.disconnectedCard]}>
                <View style={styles.connectionIcon}>
                  <Satellite size={24} color={authenticated ? '#bf7af0' : '#ff6b6b'} />
                  {authenticated && <View style={styles.connectionPulse} />}
                </View>
                <Text style={styles.connectionTitle}>Trading Hub</Text>
                <Text style={styles.connectionStatus}>
                  {authenticated ? 'Online' : 'Offline'}
                </Text>
                {userId && (
                  <Text style={styles.connectionDetail}>
                    {formatUserId(userId)}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Atomiq Bitcoin Withdrawal */}
          <View style={styles.atomiqSection}>
            <Text style={styles.sectionTitle}>Cross-Chain Withdrawal</Text>
            <TouchableOpacity 
              style={styles.atomiqCard}
              onPress={() => setShowAtomiqWithdrawal(true)}
            >
              <View style={styles.atomiqContent}>
                <View style={styles.atomiqHeader}>
                  <View style={styles.atomiqIconContainer}>
                    <Image 
                      source={require('@/assets/images/logos/atomiq_logo.webp')}
                      style={styles.atomiqLogo}
                    />
                  </View>
                  <View style={styles.atomiqInfo}>
                    <Text style={styles.atomiqTitle}>Withdraw to Bitcoin</Text>
                    <Text style={styles.atomiqSubtitle}>Secured by Bitcoin's Proof of Work</Text>
                  </View>
                  <ArrowRight size={20} color="#bf7af0" />
                </View>
                <View style={styles.atomiqFeatures}>
                  <View style={styles.atomiqFeature}>
                    <Shield size={14} color="#10B981" />
                    <Text style={styles.atomiqFeatureText}>Zero slippage</Text>
                  </View>
                  <View style={styles.atomiqFeature}>
                    <Zap size={14} color="#10B981" />
                    <Text style={styles.atomiqFeatureText}>Atomic swaps</Text>
                  </View>
                  <View style={styles.atomiqFeature}>
                    <Target size={14} color="#10B981" />
                    <Text style={styles.atomiqFeatureText}>5-10 min</Text>
                  </View>
                </View>
                <View style={styles.atomiqDescription}>
                  <Text style={styles.atomiqDescriptionText}>
                    Convert your Starknet tokens to Bitcoin using Atomiq Labs' trustless cross-chain protocol
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Galaxy Explorer Streak */}
          <View ref={streakSectionRef} style={styles.streakContainer}>
            <Text style={styles.sectionTitle}>Galaxy Explorer</Text>
            <View style={styles.streakCard}>
              <View style={styles.streakContent}>
                <View style={styles.streakHeader}>
                  <View style={styles.streakIconContainer}>
                    <Rocket size={32} color="#bf7af0" />
                  </View>
                  <View style={styles.streakInfo}>
                    <Text style={styles.streakTitle}>Exploration Streak</Text>
                    <Text style={styles.streakSubtitle}>Days exploring the galaxy</Text>
                  </View>
                </View>
                <View style={styles.streakStats}>
                  <View style={styles.streakStat}>
                    <Text style={styles.streakStatValue}>
                      {streakInfo?.galaxy_explorer_days || userProfile?.streaks?.galaxy_explorer?.current_streak || 0}
                    </Text>
                    <Text style={styles.streakStatLabel}>Current</Text>
                  </View>
                  <View style={styles.streakDivider} />
                  <View style={styles.streakStat}>
                    <Text style={styles.streakStatValue}>
                      {userProfile?.streaks?.galaxy_explorer?.longest_streak || 0}
                    </Text>
                    <Text style={styles.streakStatLabel}>Best</Text>
                  </View>
                </View>
                <View style={styles.streakProgress}>
                  <View style={styles.streakProgressBar}>
                    <View style={[
                      styles.streakProgressFill,
                      { width: `${Math.min(((streakInfo?.galaxy_explorer_days || 0) / 30) * 100, 100)}%` }
                    ]} />
                  </View>
                  <Text style={styles.streakProgressText}>
                    {streakInfo?.galaxy_explorer_days || 0}/30 days
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Achievements Section */}
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
              {achievements.map((achievement) => (
                <View key={achievement.id} style={[styles.achievementCard, !achievement.unlocked && styles.achievementLocked]}>
                  <View style={[styles.achievementIcon, !achievement.unlocked && styles.achievementIconLocked]}>
                    <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
                  </View>
                  <Text style={[styles.achievementName, !achievement.unlocked && styles.achievementNameLocked]}>
                    {achievement.name}
                  </Text>
                  <Text style={[styles.achievementDesc, !achievement.unlocked && styles.achievementDescLocked]}>
                    {achievement.description}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Trading Performance */}
          <View style={styles.performanceSection}>
            <Text style={styles.sectionTitle}>Trading Performance</Text>
            <View style={styles.performanceGrid}>
              <View style={styles.performanceCard}>
                <View style={styles.performanceHeader}>
                  <Target size={20} color="#bf7af0" />
                  <Text style={styles.performanceTitle}>Accuracy</Text>
                </View>
                <Text style={styles.performanceValue}>89%</Text>
                <Text style={styles.performanceChange}>+2.1% this week</Text>
              </View>
              
              <View style={styles.performanceCard}>
                <View style={styles.performanceHeader}>
                  <Zap size={20} color="#bf7af0" />
                  <Text style={styles.performanceTitle}>Efficiency</Text>
                </View>
                <Text style={styles.performanceValue}>94%</Text>
                <Text style={styles.performanceChange}>+1.8% this week</Text>
              </View>
              
              <View style={styles.performanceCard}>
                <View style={styles.performanceHeader}>
                  <Star size={20} color="#bf7af0" />
                  <Text style={styles.performanceTitle}>Experience</Text>
                </View>
                <Text style={styles.performanceValue}>2,150</Text>
                <Text style={styles.performanceChange}>+180 this week</Text>
              </View>
              
              <View style={styles.performanceCard}>
                <View style={styles.performanceHeader}>
                  <Wallet size={20} color="#bf7af0" />
                  <Text style={styles.performanceTitle}>Balance</Text>
                </View>
                <Text style={styles.performanceValue}>$5,280</Text>
                <Text style={styles.performanceChange}>Available</Text>
              </View>
            </View>
          </View>

          {/* Navigation Sections */}
          <View style={styles.navigationSection}>
            <Text style={styles.sectionTitle}>Command Center</Text>
            
            <View style={styles.navigationGrid}>
              <TouchableOpacity style={styles.navCard}>
                <View style={styles.navCardContent}>
                  <User size={24} color="#bf7af0" />
                  <Text style={styles.navCardTitle}>Profile</Text>
                  <Text style={styles.navCardSubtitle}>Account settings</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.navCard}>
                <View style={styles.navCardContent}>
                  <Shield size={24} color="#bf7af0" />
                  <Text style={styles.navCardTitle}>Security</Text>
                  <Text style={styles.navCardSubtitle}>2FA & passwords</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.navCard}>
                <View style={styles.navCardContent}>
                  <Settings size={24} color="#bf7af0" />
                  <Text style={styles.navCardTitle}>Preferences</Text>
                  <Text style={styles.navCardSubtitle}>Trading settings</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.navCard}>
                <View style={styles.navCardContent}>
                  <TrendingUp size={24} color="#bf7af0" />
                  <Text style={styles.navCardTitle}>History</Text>
                  <Text style={styles.navCardSubtitle}>Trade logs</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Out */}
          <View style={styles.signOutSection}>
            <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
              <View style={styles.signOutContent}>
                <LogOut size={20} color="#ff6b6b" />
                <Text style={styles.signOutText}>Disconnect from Mission Control</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </ScreenWrapper>

      {/* Atomiq Withdrawal Modal */}
      {/* TODO: Create AtomiqWithdrawal component
      <AtomiqWithdrawal 
        visible={showAtomiqWithdrawal}
        onClose={() => setShowAtomiqWithdrawal(false)}
      />
      */}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    marginBottom: 20,
  },
  heroContainer: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(191, 122, 240, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(191, 122, 240, 0.2)',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#bf7af0',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0a0a0f',
    shadowColor: '#bf7af0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#bf7af0',
    marginBottom: 4,
  },
  userTitle: {
    fontSize: 16,
    color: '#a0a0a0',
    marginBottom: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#bf7af0',
    fontWeight: '500',
  },
  quickStatsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(191, 122, 240, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.3)',
    shadowColor: '#bf7af0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  quickStatContent: {
    padding: 16,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#bf7af0',
    marginTop: 8,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    marginTop: 2,
  },
  quickStatChange: {
    fontSize: 10,
    color: '#bf7af0',
    fontWeight: '500',
    marginTop: 2,
  },
  connectionSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#bf7af0',
    marginBottom: 16,
  },
  connectionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  connectionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    position: 'relative',
  },
  connectedCard: {
    backgroundColor: 'rgba(191, 122, 240, 0.1)',
    borderColor: 'rgba(191, 122, 240, 0.4)',
    shadowColor: '#bf7af0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disconnectedCard: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderColor: 'rgba(255, 107, 107, 0.4)',
  },
  connectionIcon: {
    position: 'relative',
    marginBottom: 8,
  },
  connectionPulse: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#bf7af0',
    opacity: 0.8,
  },
  connectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  connectionStatus: {
    fontSize: 12,
    color: '#bf7af0',
    fontWeight: '500',
    marginBottom: 4,
  },
  connectionDetail: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  atomiqSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  atomiqCard: {
    borderRadius: 20,
    backgroundColor: 'rgba(191, 122, 240, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.4)',
    shadowColor: '#bf7af0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  atomiqContent: {
    padding: 20,
  },
  atomiqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  atomiqIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(191, 122, 240, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.4)',
  },
  atomiqLogo: {
    width: 24,
    height: 24,
  },
  atomiqInfo: {
    flex: 1,
  },
  atomiqTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#bf7af0',
    marginBottom: 4,
  },
  atomiqSubtitle: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  atomiqFeatures: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  atomiqFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  atomiqFeatureText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
  },
  atomiqDescription: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
  },
  atomiqDescriptionText: {
    fontSize: 12,
    color: '#a0a0a0',
    lineHeight: 16,
  },
  streakContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  streakCard: {
    borderRadius: 20,
    backgroundColor: 'rgba(191, 122, 240, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.4)',
    shadowColor: '#bf7af0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  streakContent: {
    padding: 24,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(191, 122, 240, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.4)',
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#bf7af0',
    marginBottom: 4,
  },
  streakSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  streakStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  streakStat: {
    alignItems: 'center',
  },
  streakStatValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#bf7af0',
  },
  streakStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0, 255, 255, 0.3)',
  },
  streakProgress: {
    alignItems: 'center',
  },
  streakProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(191, 122, 240, 0.2)',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.3)',
  },
  streakProgressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#bf7af0',
  },
  streakProgressText: {
    fontSize: 14,
    color: '#bf7af0',
    fontWeight: '600',
  },
  achievementsSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  achievementsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  achievementCard: {
    width: 120,
    marginRight: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(191, 122, 240, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.3)',
    alignItems: 'center',
    shadowColor: '#bf7af0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  achievementLocked: {
    opacity: 0.5,
    backgroundColor: 'rgba(100, 100, 100, 0.1)',
    borderColor: 'rgba(100, 100, 100, 0.3)',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(191, 122, 240, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.4)',
  },
  achievementIconLocked: {
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
    borderColor: 'rgba(100, 100, 100, 0.4)',
  },
  achievementEmoji: {
    fontSize: 20,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#bf7af0',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementNameLocked: {
    color: '#666',
  },
  achievementDesc: {
    fontSize: 10,
    color: '#a0a0a0',
    textAlign: 'center',
  },
  achievementDescLocked: {
    color: '#555',
  },
  performanceSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  performanceCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(191, 122, 240, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.3)',
    shadowColor: '#bf7af0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  performanceTitle: {
    fontSize: 12,
    color: '#a0a0a0',
    marginLeft: 8,
  },
  performanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#bf7af0',
    marginBottom: 4,
  },
  performanceChange: {
    fontSize: 10,
    color: '#bf7af0',
    fontWeight: '500',
  },
  navigationSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  navigationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  navCard: {
    width: (width - 52) / 2,
    borderRadius: 16,
    backgroundColor: 'rgba(191, 122, 240, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.3)',
    shadowColor: '#bf7af0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  navCardContent: {
    padding: 16,
    alignItems: 'center',
  },
  navCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#bf7af0',
    marginTop: 8,
    marginBottom: 2,
  },
  navCardSubtitle: {
    fontSize: 10,
    color: '#a0a0a0',
    textAlign: 'center',
  },
  signOutSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  signOutButton: {
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signOutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  signOutText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 40,
  },
});