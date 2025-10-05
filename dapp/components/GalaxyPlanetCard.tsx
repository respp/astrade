import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Star, Target } from 'lucide-react-native';
import { createShadow, shadowPresets } from '@/lib/platform-styles';

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
}

interface GalaxyPlanetCardProps {
  planet: Planet;
  onPress: () => void;
}

export default function GalaxyPlanetCard({ planet, onPress }: GalaxyPlanetCardProps) {
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
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.planetSection}>
        <LinearGradient
          colors={[planet.color, `${planet.color}80`]}
          style={styles.planet}
        >
          <View style={styles.planetGlow} />
          <View style={styles.planetSurface}>
            <View style={styles.crater1} />
            <View style={styles.crater2} />
          </View>
        </LinearGradient>
        
        <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
          <Text style={styles.levelText}>{planet.level}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{planet.name}</Text>
          <Text style={styles.type}>{planet.type}</Text>
        </View>
        
        <Text style={styles.description}>{planet.description}</Text>
        
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressValue}>{planet.progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${planet.progress}%` }]} />
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Target size={16} color="#3B82F6" />
            <Text style={styles.statText}>
              {planet.completedMissions}/{planet.totalMissions} Missions
            </Text>
          </View>
          <View style={styles.statItem}>
            <Star size={16} color="#FBBF24" />
            <Text style={styles.statText}>
              {Math.floor(planet.completedMissions / 3)} Achievements
            </Text>
          </View>
        </View>
      </View>

      <ChevronRight size={20} color="#9CA3AF" style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    marginBottom: 12,
  },
  planetSection: {
    position: 'relative',
    marginRight: 15,
  },
  planet: {
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'relative',
    ...createShadow(shadowPresets.small),
  },
  planetGlow: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    top: -2,
    left: -2,
  },
  planetSurface: {
    flex: 1,
    position: 'relative',
  },
  crater1: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    top: 12,
    left: 18,
  },
  crater2: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    bottom: 15,
    right: 20,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  type: {
    fontSize: 12,
    color: '#9CA3AF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  description: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  chevron: {
    marginLeft: 8,
  },
});