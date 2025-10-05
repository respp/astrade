import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { useRewards } from '@/lib/hooks/useRewards';
import AstradeCoin from '@/components/icons/AstradeCoin';

const { width } = Dimensions.get('window');

interface GameNavbarProps {
  onSettingsPress?: () => void;
  onNotificationsPress?: () => void;
  onMissionsPress?: () => void;
  onProfilePress?: () => void;
  onStreakPress?: () => void;
}

export default function GameNavbar({
  onSettingsPress,
  onNotificationsPress,
  onMissionsPress,
  onProfilePress,
  onStreakPress,
}: GameNavbarProps) {
  const { authenticated } = useAuth();
  const { wallet } = useWallet();
  const { userProfile, streakInfo } = useRewards();

  // Mock data - replace with real data from your backend
  const playerLevel = 26;
  const levelProgress = { current: 5, max: 7 };
  const primaryCurrency = 640;
  const secondaryCurrency = 2525;
  const premiumCurrency = 89;
  const missionsAvailable = 3;
  const notificationsCount = 7;
  const explorationStreak = streakInfo?.galaxy_explorer_days || userProfile?.streaks?.galaxy_explorer?.current_streak || 1;
  const bestStreak = userProfile?.streaks?.galaxy_explorer?.longest_streak || 1;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(26, 26, 46, 0.95)', 'rgba(15, 15, 35, 0.95)']}
        style={styles.background}
      >
                <View style={styles.mainRow}>
          {/* Settings */}
          <TouchableOpacity style={styles.navItem} onPress={onSettingsPress}>
            <Image 
              source={require('@/assets/images/top-nav/setting.png')} 
              style={styles.navIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Exploration Streak */}
          <TouchableOpacity style={styles.navItem} onPress={onStreakPress}>
            <Image 
              source={require('@/assets/images/top-nav/energy.png')} 
              style={styles.navIcon}
              resizeMode="contain"
            />
            <Text style={styles.navText}>{explorationStreak}</Text>
          </TouchableOpacity>

          {/* Profile - CENTER */}
          <TouchableOpacity style={styles.navItem} onPress={onProfilePress}>
            <Image 
              source={require('@/assets/images/top-nav/profile.png')} 
              style={styles.navIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Gold Currency */}
          <View style={styles.navItem}>
            <AstradeCoin size={24} />
            <Text style={styles.navText}>{secondaryCurrency}</Text>
          </View>

          {/* Missions */}
          <TouchableOpacity style={styles.navItem} onPress={onMissionsPress}>
            <Image 
              source={require('@/assets/images/top-nav/missions.png')} 
              style={styles.navIcon}
              resizeMode="contain"
            />
            {missionsAvailable > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{missionsAvailable}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  background: {
    paddingTop: 50, // Safe area
    paddingHorizontal: 16,
    paddingBottom: 12,
    width: '90%', // Wider for better distribution
    maxWidth: 480, // Max width for desktop
    alignSelf: 'center',
    borderRadius: 24,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    gap: 8,
  },
  navIcon: {
    width: 24,
    height: 24,
  },
  iconButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  missionsContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    minWidth: 60,
  },
  streakIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  playerAvatarContainer: {
    alignItems: 'center',
  },
  avatarHexagon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#8B5CF6',
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerStats: {
    marginTop: 8,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  xpIcon: {
    fontSize: 12,
  },
  xpText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  goldCurrencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    minWidth: 60,
  },
  goldCurrencyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 6,
    minWidth: 60,
    justifyContent: 'center',
    position: 'relative',
    flex: 1,
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },

}); 