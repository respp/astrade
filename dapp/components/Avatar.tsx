import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createShadow, shadowPresets } from '@/lib/platform-styles';

interface AvatarProps {
  level: number;
}

export default function Avatar({ level }: AvatarProps) {
  const getAvatarColors = (level: number) => {
    if (level >= 10) return ['#F59E0B', '#EF4444', '#8B5CF6'];
    if (level >= 7) return ['#10B981', '#3B82F6'];
    if (level >= 4) return ['#3B82F6', '#8B5CF6'];
    return ['#6B7280', '#9CA3AF'];
  };

  const colors = getAvatarColors(level);

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Image 
          source={require('@/assets/images/navbar/avatar.png')}
          style={styles.avatarImage}
          resizeMode="cover"
        />
      </View>
      {level >= 5 && <View style={styles.halo} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...createShadow(shadowPresets.medium),
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eye: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 3,
    marginBottom: 2,
  },
  mouth: {
    width: 8,
    height: 4,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 4,
  },
  halo: {
    position: 'absolute',
    top: -5,
    left: 5,
    width: 50,
    height: 10,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FBBF24',
    opacity: 0.8,
  },
});