import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CircleCheck as CheckCircle } from 'lucide-react-native';

interface Mission {
  id: number;
  title: string;
  description: string;
  reward: string;
  progress: number;
  total: number;
  completed: boolean;
  icon: React.ReactNode;
}

interface MissionCardProps {
  mission: Mission;
}

export default function MissionCard({ mission }: MissionCardProps) {
  const progressPercentage = (mission.progress / mission.total) * 100;

  return (
    <TouchableOpacity style={[styles.container, mission.completed && styles.completedContainer]}>
      <View style={styles.iconContainer}>
        {mission.completed ? (
          <CheckCircle size={24} color="#10B981" />
        ) : (
          mission.icon
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{mission.title}</Text>
        <Text style={styles.description}>{mission.description}</Text>
        
        {!mission.completed && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {mission.progress}/{mission.total}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.rewardContainer}>
        <Text style={styles.reward}>{mission.reward}</Text>
        {mission.completed && (
          <Text style={styles.completedText}>Completed!</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  completedContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  iconContainer: {
    marginRight: 15,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  rewardContainer: {
    alignItems: 'flex-end',
  },
  reward: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  completedText: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 2,
  },
});