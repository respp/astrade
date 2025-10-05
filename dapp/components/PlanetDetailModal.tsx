import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Star, Target, Trophy, Gift, CircleCheck as CheckCircle, Circle } from 'lucide-react-native';
import { createShadow, shadowPresets } from '@/lib/platform-styles';

interface Achievement {
  id: number;
  name: string;
  description: string;
  completed: boolean;
  reward: string;
}

interface Mission {
  id: number;
  name: string;
  description: string;
  progress: number;
  total: number;
  completed: boolean;
  reward: string;
}

interface Planet {
  id: number;
  name: string;
  type: string;
  level: string;
  color: string;
  description: string;
  progress: number;
  totalMissions: number;
  completedMissions: number;
  achievements: Achievement[];
  missions: Mission[];
}

interface PlanetDetailModalProps {
  planet: Planet;
  visible: boolean;
  onClose: () => void;
}

export default function PlanetDetailModal({ planet, visible, onClose }: PlanetDetailModalProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return '#10B981';
      case 'Intermediate': return '#3B82F6';
      case 'Advanced': return '#8B5CF6';
      case 'Expert': return '#EC4899';
      case 'Master': return '#F59E0B';
      default: return '#9CA3AF';
    }
  };

  const levelColor = getLevelColor(planet.level);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{planet.name}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Planet Visual */}
          <View style={styles.planetSection}>
            <LinearGradient
              colors={[planet.color, `${planet.color}80`, `${planet.color}40`]}
              style={styles.largePlanet}
            >
              <View style={styles.planetGlow} />
              <View style={styles.planetSurface}>
                <View style={styles.crater1} />
                <View style={styles.crater2} />
                <View style={styles.crater3} />
              </View>
            </LinearGradient>
            
            <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
              <Text style={styles.levelText}>{planet.level}</Text>
            </View>
          </View>

          {/* Planet Info */}
          <View style={styles.infoSection}>
            <Text style={styles.planetName}>{planet.name}</Text>
            <Text style={styles.planetType}>{planet.type}</Text>
            <Text style={styles.planetDescription}>{planet.description}</Text>
          </View>

          {/* Progress Overview */}
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Planet Progress</Text>
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Overall Completion</Text>
                <Text style={styles.progressValue}>{planet.progress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={['#10B981', '#3B82F6']}
                  style={[styles.progressFill, { width: `${planet.progress}%` }]}
                />
              </View>
              <View style={styles.progressStats}>
                <Text style={styles.progressStat}>
                  {planet.completedMissions}/{planet.totalMissions} Missions Complete
                </Text>
                <Text style={styles.progressStat}>
                  {planet.achievements.filter(a => a.completed).length}/{planet.achievements.length} Achievements Unlocked
                </Text>
              </View>
            </View>
          </View>

          {/* Achievements */}
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            {planet.achievements.map((achievement) => (
              <View key={achievement.id} style={[
                styles.achievementCard,
                achievement.completed && styles.completedAchievement
              ]}>
                <View style={styles.achievementIcon}>
                  {achievement.completed ? (
                    <Trophy size={20} color="#FBBF24" />
                  ) : (
                    <Trophy size={20} color="#6B7280" />
                  )}
                </View>
                <View style={styles.achievementContent}>
                  <Text style={[
                    styles.achievementName,
                    achievement.completed && styles.completedText
                  ]}>
                    {achievement.name}
                  </Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.description}
                  </Text>
                  <Text style={[
                    styles.achievementReward,
                    achievement.completed && styles.completedReward
                  ]}>
                    Reward: {achievement.reward}
                  </Text>
                </View>
                <View style={styles.achievementStatus}>
                  {achievement.completed ? (
                    <CheckCircle size={20} color="#10B981" />
                  ) : (
                    <Circle size={20} color="#6B7280" />
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Active Missions */}
          <View style={styles.missionsSection}>
            <Text style={styles.sectionTitle}>Active Missions</Text>
            {planet.missions.map((mission) => (
              <View key={mission.id} style={[
                styles.missionCard,
                mission.completed && styles.completedMission
              ]}>
                <View style={styles.missionIcon}>
                  {mission.completed ? (
                    <CheckCircle size={20} color="#10B981" />
                  ) : (
                    <Target size={20} color="#3B82F6" />
                  )}
                </View>
                <View style={styles.missionContent}>
                  <Text style={[
                    styles.missionName,
                    mission.completed && styles.completedText
                  ]}>
                    {mission.name}
                  </Text>
                  <Text style={styles.missionDescription}>
                    {mission.description}
                  </Text>
                  {!mission.completed && (
                    <View style={styles.missionProgress}>
                      <View style={styles.missionProgressBar}>
                        <View style={[
                          styles.missionProgressFill,
                          { width: `${(mission.progress / mission.total) * 100}%` }
                        ]} />
                      </View>
                      <Text style={styles.missionProgressText}>
                        {mission.progress}/{mission.total}
                      </Text>
                    </View>
                  )}
                  <Text style={[
                    styles.missionReward,
                    mission.completed && styles.completedReward
                  ]}>
                    Reward: {mission.reward}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  planetSection: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  largePlanet: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'relative',
    ...createShadow(shadowPresets.large),
  },
  planetGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    top: -5,
    left: -5,
  },
  planetSurface: {
    flex: 1,
    position: 'relative',
  },
  crater1: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    top: 20,
    left: 30,
  },
  crater2: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    top: 50,
    right: 25,
  },
  crater3: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    bottom: 30,
    left: 45,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -10,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  planetName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  planetType: {
    fontSize: 14,
    color: '#9CA3AF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  planetDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
  progressSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressStats: {
    gap: 4,
  },
  progressStat: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  achievementsSection: {
    marginBottom: 30,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  completedAchievement: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  achievementIcon: {
    marginRight: 15,
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  achievementReward: {
    fontSize: 12,
    color: '#FBBF24',
    fontWeight: '600',
  },
  achievementStatus: {
    marginLeft: 10,
  },
  completedText: {
    color: '#10B981',
  },
  completedReward: {
    color: '#10B981',
  },
  missionsSection: {
    marginBottom: 30,
  },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  completedMission: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  missionIcon: {
    marginRight: 15,
    marginTop: 2,
  },
  missionContent: {
    flex: 1,
  },
  missionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  missionDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  missionProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 10,
  },
  missionProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  missionProgressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  missionProgressText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  missionReward: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
});