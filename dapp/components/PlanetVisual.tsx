import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createShadow, shadowPresets } from '@/lib/platform-styles';

interface PlanetVisualProps {
  level: number;
}

export default function PlanetVisual({ level }: PlanetVisualProps) {
  const getPlanetColors = (level: number) => {
    if (level >= 10) return ['#8B5CF6', '#EC4899', '#F59E0B'];
    if (level >= 7) return ['#10B981', '#3B82F6', '#8B5CF6'];
    if (level >= 4) return ['#3B82F6', '#10B981'];
    return ['#6B7280', '#9CA3AF'];
  };

  const colors = getPlanetColors(level);

  return (
    <View style={styles.container}>
      {/* Planet Body */}
      <LinearGradient
        colors={colors as unknown as readonly [string, string, ...string[]]}
        style={styles.planet}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Planet Surface Details */}
        <View style={styles.crater1} />
        <View style={styles.crater2} />
        <View style={styles.crater3} />
        
        {/* Atmospheric Glow */}
        <View style={styles.atmosphere} />
      </LinearGradient>
      
      {/* Ring System (for higher levels) */}
      {level >= 5 && (
        <View style={styles.ringContainer}>
          <View style={styles.ring1} />
          <View style={styles.ring2} />
        </View>
      )}
      
      {/* Orbital Stations (for very high levels) */}
      {level >= 8 && (
        <>
          <View style={[styles.station, styles.station1]} />
          <View style={[styles.station, styles.station2]} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planet: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'relative',
    ...createShadow(shadowPresets.large),
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
  atmosphere: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    top: -5,
    left: -5,
  },
  ringContainer: {
    position: 'absolute',
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring1: {
    position: 'absolute',
    width: 160,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.4)',
    transform: [{ rotate: '15deg' }],
  },
  ring2: {
    position: 'absolute',
    width: 140,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    transform: [{ rotate: '15deg' }],
  },
  station: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FBBF24',
    ...createShadow({
      color: '#FBBF24',
      opacity: 0.8,
      radius: 4,
      offsetY: 0,
      elevation: 3,
    }),
  },
  station1: {
    top: 20,
    right: 10,
  },
  station2: {
    bottom: 25,
    left: 15,
  },
});