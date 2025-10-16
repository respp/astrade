import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createShadow, shadowPresets } from '../lib/platform-styles';
import { missionEngine } from '../lib/missions/engine';
import { 
  StoryMission, 
  UserMissionProgress, 
  CRYPTO_PRIME_MISSIONS, 
  DEFI_NEXUS_MISSIONS,
  VESU_MISSIONS,
  STARKNET_TOKEN_MISSIONS
} from '../lib/missions/types';
import { ordersService } from '../lib/api';

interface MissionsModalProps {
  visible: boolean;
  onClose: () => void;
  planetIndex: number;
  planetName: string;
  planetColor: string;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  visible,
  onClose,
  planetIndex,
  planetName,
  planetColor,
}) => {
  const [missions, setMissions] = useState<StoryMission[]>([]);
  const [userProgress, setUserProgress] = useState<UserMissionProgress[]>([]);
  const [selectedMission, setSelectedMission] = useState<StoryMission | null>(null);

  // TODO: Get real user ID from auth context
  const userId = 'demo-user';

  useEffect(() => {
    if (visible) {
      loadMissions();
      loadUserProgress();
    }
  }, [visible, planetIndex]);

  const loadMissions = () => {
    let planetMissions: StoryMission[] = [];
    
    switch (planetIndex) {
      case 0:
        planetMissions = CRYPTO_PRIME_MISSIONS;
        break;
      case 1:
        planetMissions = DEFI_NEXUS_MISSIONS;
        break;
      case 4:
        planetMissions = VESU_MISSIONS;
        break;
      case 5:
        planetMissions = STARKNET_TOKEN_MISSIONS;
        break;
      default:
        planetMissions = [];
    }
    
    setMissions(planetMissions);
  };

  const loadUserProgress = () => {
    const activeMissions = missionEngine.getUserActiveMissions(userId);
    const completedMissions = missionEngine.getUserCompletedMissions(userId);
    setUserProgress([...activeMissions, ...completedMissions]);
  };

  const getMissionStatus = (mission: StoryMission): 'locked' | 'available' | 'in_progress' | 'completed' => {
    const progress = userProgress.find(p => p.missionId === mission.id);
    
    if (progress) {
      return progress.status === 'completed' ? 'completed' : 'in_progress';
    }
    
    // Check prerequisites
    if (mission.prerequisites) {
      const prerequisitesMet = mission.prerequisites.every(prereqId =>
        userProgress.some(p => p.missionId === prereqId && p.status === 'completed')
      );
      return prerequisitesMet ? 'available' : 'locked';
    }
    
    return 'available';
  };

  const getMissionProgress = (mission: StoryMission): number => {
    const progress = userProgress.find(p => p.missionId === mission.id);
    if (!progress) return 0;
    
    const completedObjectives = Object.values(progress.objectives).filter(obj => obj.completed).length;
    return (completedObjectives / mission.objectives.length) * 100;
  };

  const startMission = (mission: StoryMission) => {
    const status = getMissionStatus(mission);
    
    if (status === 'locked') {
      Alert.alert('Mission Locked', 'Complete previous missions to unlock this one.');
      return;
    }
    
    if (status === 'completed') {
      Alert.alert('Mission Completed', 'You have already completed this mission!');
      return;
    }
    
    if (status === 'available') {
      // Start the mission
      const newProgress = missionEngine.startMission(userId, mission);
      setUserProgress(prev => [...prev, newProgress]);
      Alert.alert('Mission Started!', `You've started: ${mission.title}`);
    }
    
    setSelectedMission(mission);
  };

  const renderMissionCard = (mission: StoryMission) => {
    const status = getMissionStatus(mission);
    const progress = getMissionProgress(mission);
    
    return (
      <TouchableOpacity
        key={mission.id}
        style={[
          styles.missionCard,
          status === 'locked' && styles.lockedMission,
          createShadow(shadowPresets.medium),
        ]}
        onPress={() => startMission(mission)}
        disabled={status === 'locked'}
      >
        <LinearGradient
          colors={status === 'locked' ? ['#444', '#222'] : ['rgba(191, 122, 240, 0.1)', 'rgba(191, 122, 240, 0.05)'] as any}
          style={styles.missionGradient}
        >
          <View style={styles.missionHeader}>
            <Text style={[styles.missionTitle, status === 'locked' && styles.lockedText]}>
              {mission.title}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
              <Text style={styles.statusText}>{getStatusText(status)}</Text>
            </View>
          </View>
          
          <Text style={[styles.missionDescription, status === 'locked' && styles.lockedText]}>
            {mission.description}
          </Text>
          
          {status === 'in_progress' && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>Progress: {progress.toFixed(0)}%</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>
          )}
          
          <View style={styles.missionFooter}>
            <Text style={[styles.difficulty, status === 'locked' && styles.lockedText]}>
              {mission.difficulty.toUpperCase()}
            </Text>
            <Text style={[styles.estimatedTime, status === 'locked' && styles.lockedText]}>
              ~{mission.estimatedTime}min
            </Text>
          </View>
          
          <View style={styles.rewardsContainer}>
            {mission.rewards.map((reward, index) => (
              <Text key={index} style={[styles.reward, status === 'locked' && styles.lockedText]}>
                {reward.description}
              </Text>
            ))}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'in_progress': return '#bf7af0';
      case 'available': return '#bf7af0';
      case 'locked': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'completed': return 'COMPLETED';
      case 'in_progress': return 'IN PROGRESS';
      case 'available': return 'AVAILABLE';
      case 'locked': return 'LOCKED';
      default: return 'UNKNOWN';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['#0a0a0f', '#0f0f1a', '#1a1a2e'] as unknown as readonly [string, string, ...string[]]}
          style={styles.background}
        >
          <View style={styles.header}>
            <Text style={styles.planetTitle}>{planetName} Missions</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.missionsContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.storyIntro}>
              Welcome to {planetName}! Complete trading missions to master the art of perpetual trading
              and unlock the secrets of this galactic trading hub.
            </Text>
            
            {missions.map(renderMissionCard)}
            
            {missions.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>🚧</Text>
                <Text style={styles.emptyTitle}>Coming Soon</Text>
                <Text style={styles.emptyDescription}>
                  Missions for this planet are being prepared. Check back soon!
                </Text>
              </View>
            )}
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  planetTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#bf7af0',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(191, 122, 240, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.3)',
    shadowColor: '#bf7af0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  closeText: {
    color: '#bf7af0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  missionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  storyIntro: {
    color: '#a0a0a0',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  missionCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.3)',
    shadowColor: '#bf7af0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  lockedMission: {
    opacity: 0.6,
  },
  missionGradient: {
    padding: 20,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#bf7af0',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.4)',
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  missionDescription: {
    color: '#a0a0a0',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    color: '#bf7af0',
    fontSize: 12,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(191, 122, 240, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.3)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#bf7af0',
    borderRadius: 3,
  },
  missionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  difficulty: {
    color: '#bf7af0',
    fontSize: 12,
    fontWeight: 'bold',
  },
  estimatedTime: {
    color: '#a0a0a0',
    fontSize: 12,
  },
  rewardsContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(191, 122, 240, 0.3)',
    paddingTop: 12,
  },
  reward: {
    color: '#10B981',
    fontSize: 12,
    marginBottom: 4,
  },
  lockedText: {
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#bf7af0',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyDescription: {
    color: '#a0a0a0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 