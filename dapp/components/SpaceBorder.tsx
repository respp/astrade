import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

interface SpaceBorderProps {
  children: React.ReactNode;
  size?: number;
  color?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export const SpaceBorder: React.FC<SpaceBorderProps> = ({
  children,
  size = 80,
  color = '#8B5CF6'
}) => {
  const rotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);

  // Generar partículas aleatorias
  const particles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * size,
    y: Math.random() * size,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 2000,
    duration: Math.random() * 2000 + 1000,
  }));

  useEffect(() => {
    // Rotación continua del borde
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 8000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Efecto de brillo pulsante
    glowOpacity.value = withRepeat(
      withTiming(0.8, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const AnimatedParticle = ({ particle }: { particle: Particle }) => {
    const particleOpacity = useSharedValue(0);
    const particleScale = useSharedValue(0);

    useEffect(() => {
      particleOpacity.value = withDelay(
        particle.delay,
        withRepeat(
          withTiming(1, {
            duration: particle.duration,
            easing: Easing.inOut(Easing.ease),
          }),
          -1,
          true
        )
      );

      particleScale.value = withDelay(
        particle.delay,
        withRepeat(
          withTiming(1, {
            duration: particle.duration,
            easing: Easing.inOut(Easing.ease),
          }),
          -1,
          true
        )
      );
    }, []);

    const particleAnimatedStyle = useAnimatedStyle(() => ({
      opacity: particleOpacity.value,
      transform: [{ scale: particleScale.value }],
    }));

    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            borderRadius: particle.size / 2,
            backgroundColor: color,
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: particle.size,
            elevation: 8,
          },
          particleAnimatedStyle,
        ]}
      />
    );
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Borde espacial animado */}
      <Animated.View style={[styles.spaceBorder, borderAnimatedStyle]}>
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="spaceGradient" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <Stop offset="50%" stopColor={color} stopOpacity="0.4" />
              <Stop offset="100%" stopColor={color} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 2}
            fill="none"
            stroke="url(#spaceGradient)"
            strokeWidth="2"
            strokeDasharray="8,8"
          />
        </Svg>
      </Animated.View>

      {/* Efecto de brillo */}
      <Animated.View style={[styles.glowEffect, glowAnimatedStyle]} />

      {/* Partículas */}
      {particles.map((particle) => (
        <AnimatedParticle key={particle.id} particle={particle} />
      ))}

      {/* Contenido */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 10,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
}); 