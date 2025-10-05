import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Enhanced configuration for more realistic star distribution
const STAR_COUNTS = {
  tiny: 120,
  small: 80,
  medium: 40,
  large: 15,
  particles: 8,
};

const STAR_SIZES = {
  tiny: 0.8,
  small: 1.2,
  medium: 1.8,
  large: 2.5,
  particles: 4,
};

const PARALLAX_SPEEDS = {
  tiny: 0.3,
  small: 0.6,
  medium: 1.0,
  large: 1.4,
  particles: 2.0,
};

const STAR_COLORS = [
  '#FFFFFF',
  '#E6F3FF',
  '#F0F8FF',
  '#E6E6FA',
  '#F5F5FF',
];

interface Star {
  x: number;
  y: number;
  opacity: Animated.Value;
  scale: Animated.Value;
  translateX: Animated.Value;
  translateY?: Animated.Value;
  color: string;
  pulseOffset: number;
}

interface SpaceBackgroundProps {
  enableShootingStars?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

const SpaceBackground: React.FC<SpaceBackgroundProps> = ({ 
  enableShootingStars = true,
  intensity = 'medium'
}) => {
  const tinyStars = useRef<Star[]>([]);
  const smallStars = useRef<Star[]>([]);
  const mediumStars = useRef<Star[]>([]);
  const largeStars = useRef<Star[]>([]);
  const particles = useRef<Star[]>([]);
  const shootingStars = useRef<Animated.Value[]>([]);
  const backgroundPulse = useRef(new Animated.Value(0));

  // Enhanced star creation with better distribution
  const createStars = (count: number, size: number, layer: string): Star[] => {
    const baseCount = intensity === 'low' ? count * 0.6 : intensity === 'high' ? count * 1.4 : count;
    
    return Array.from({ length: Math.floor(baseCount) }, () => {
      // Better distribution - avoid edges and create clusters
      const margin = 50;
      const clusterChance = Math.random() > 0.7;
      
      let x, y;
      if (clusterChance && layer !== 'particles') {
        // Create star clusters
        const clusterX = margin + Math.random() * (SCREEN_WIDTH - 2 * margin);
        const clusterY = margin + Math.random() * (SCREEN_HEIGHT - 2 * margin);
        x = clusterX + (Math.random() - 0.5) * 100;
        y = clusterY + (Math.random() - 0.5) * 100;
      } else {
        x = margin + Math.random() * (SCREEN_WIDTH - 2 * margin);
        y = margin + Math.random() * (SCREEN_HEIGHT - 2 * margin);
      }

      return {
        x: Math.max(0, Math.min(SCREEN_WIDTH, x)),
        y: Math.max(0, Math.min(SCREEN_HEIGHT, y)),
        opacity: new Animated.Value(0.2 + Math.random() * 0.6),
        scale: new Animated.Value(0.8 + Math.random() * 0.4),
        translateX: new Animated.Value(0),
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        pulseOffset: Math.random() * 1000,
      };
    });
  };

  // Enhanced twinkling animation with more natural feel
  const animateStar = (star: Star, index: number) => {
    const baseDuration = 2000 + Math.random() * 3000;
    const delay = star.pulseOffset + (index * 100);
    
    const twinkle = () => {
      const targetOpacity = 0.3 + Math.random() * 0.7;
      const targetScale = 0.8 + Math.random() * 0.4;
      
      Animated.parallel([
        Animated.timing(star.opacity, {
          toValue: targetOpacity,
          duration: baseDuration,
          useNativeDriver: false,
        }),
        Animated.timing(star.scale, {
          toValue: targetScale,
          duration: baseDuration * 0.8,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setTimeout(twinkle, Math.random() * 1000);
      });
    };

    setTimeout(twinkle, delay);
  };

  // Smoother parallax with different patterns
  const animateParallax = (star: Star, speed: number, pattern: 'horizontal' | 'drift' | 'float') => {
    const animate = () => {
      let animations: Animated.CompositeAnimation;
      
      switch (pattern) {
        case 'horizontal':
          animations = Animated.sequence([
            Animated.timing(star.translateX, {
              toValue: -30 * speed,
              duration: 20000 / speed,
              useNativeDriver: false,
            }),
            Animated.timing(star.translateX, {
              toValue: 0,
              duration: 0,
              useNativeDriver: false,
            }),
          ]);
          break;
          
        case 'drift':
          if (!star.translateY) {
            star.translateY = new Animated.Value(0);
          }
          animations = Animated.parallel([
            Animated.timing(star.translateX, {
              toValue: -20 * speed,
              duration: 25000 / speed,
              useNativeDriver: false,
            }),
            Animated.timing(star.translateY, {
              toValue: -10 * speed,
              duration: 30000 / speed,
              useNativeDriver: false,
            }),
          ]);
          break;
          
        case 'float':
          if (!star.translateY) {
            star.translateY = new Animated.Value(0);
          }
          animations = Animated.loop(
            Animated.sequence([
              Animated.timing(star.translateY, {
                toValue: 5,
                duration: 4000,
                useNativeDriver: false,
              }),
              Animated.timing(star.translateY, {
                toValue: -5,
                duration: 4000,
                useNativeDriver: false,
              }),
            ])
          );
          break;
      }
      
      animations.start(() => {
        if (pattern !== 'float') {
          animate();
        }
      });
    };
    
    animate();
  };

  // Enhanced particle system
  const animateParticle = (particle: Star) => {
    if (!particle.translateY) {
      particle.translateY = new Animated.Value(0);
    }
    
    const resetParticle = () => {
      particle.x = -20 + Math.random() * 40;
      particle.y = Math.random() * SCREEN_HEIGHT;
      particle.translateX.setValue(0);
      if (particle.translateY) {
        particle.translateY.setValue(0);
      }
      particle.opacity.setValue(0);
      animateParticle(particle);
    };

    Animated.parallel([
      Animated.timing(particle.translateX, {
        toValue: SCREEN_WIDTH + 40,
        duration: 12000 + Math.random() * 8000,
        useNativeDriver: false,
      }),
      Animated.timing(particle.translateY, {
        toValue: (Math.random() - 0.5) * 100,
        duration: 12000 + Math.random() * 8000,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(particle.opacity, {
          toValue: 0.6 + Math.random() * 0.3,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 2000,
          delay: 8000,
          useNativeDriver: false,
        }),
      ]),
    ]).start(resetParticle);
  };

  // Enhanced shooting stars
  const createShootingStar = () => {
    const progress = new Animated.Value(0);
    const startY = Math.random() * SCREEN_HEIGHT * 0.6;
    shootingStars.current.push(progress);

    Animated.timing(progress, {
      toValue: 1,
      duration: 800 + Math.random() * 400,
      useNativeDriver: false,
    }).start(() => {
      const index = shootingStars.current.indexOf(progress);
      if (index > -1) {
        shootingStars.current.splice(index, 1);
      }
    });

    setTimeout(() => {
      if (enableShootingStars) {
        createShootingStar();
      }
    }, Math.random() * 15000 + 8000);
  };

  // Background pulse animation
  const animateBackground = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundPulse.current, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: false,
        }),
        Animated.timing(backgroundPulse.current, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    // Initialize star layers
    tinyStars.current = createStars(STAR_COUNTS.tiny, STAR_SIZES.tiny, 'tiny');
    smallStars.current = createStars(STAR_COUNTS.small, STAR_SIZES.small, 'small');
    mediumStars.current = createStars(STAR_COUNTS.medium, STAR_SIZES.medium, 'medium');
    largeStars.current = createStars(STAR_COUNTS.large, STAR_SIZES.large, 'large');
    particles.current = createStars(STAR_COUNTS.particles, STAR_SIZES.particles, 'particles');

    // Start animations
    const startAnimations = () => {
      tinyStars.current.forEach((star, index) => {
        animateStar(star, index);
        animateParallax(star, PARALLAX_SPEEDS.tiny, 'horizontal');
      });

      smallStars.current.forEach((star, index) => {
        animateStar(star, index);
        animateParallax(star, PARALLAX_SPEEDS.small, 'drift');
      });

      mediumStars.current.forEach((star, index) => {
        animateStar(star, index);
        animateParallax(star, PARALLAX_SPEEDS.medium, 'float');
      });

      largeStars.current.forEach((star, index) => {
        animateStar(star, index);
        animateParallax(star, PARALLAX_SPEEDS.large, 'float');
      });

      particles.current.forEach(particle => {
        animateParticle(particle);
      });

      animateBackground();

      if (enableShootingStars) {
        setTimeout(createShootingStar, 3000);
      }
    };

    startAnimations();
  }, [enableShootingStars, intensity]);

  const renderStarLayer = (stars: Star[], size: number, layerName: string) => {
    return stars.map((star, index) => (
      <Animated.View
        key={`${layerName}-${index}`}
        style={[
          styles.star,
          {
            left: star.x,
            top: star.y,
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: star.color,
            opacity: star.opacity,
            transform: [
              { translateX: star.translateX },
              { scale: star.scale },
              ...(star.translateY ? [{ translateY: star.translateY }] : []),
            ],
            shadowColor: star.color,
            shadowOpacity: layerName === 'large' || layerName === 'particles' ? 0.8 : 0.3,
            shadowRadius: layerName === 'large' ? 4 : layerName === 'particles' ? 6 : 1,
          },
        ]}
      />
    ));
  };

  const renderShootingStars = () => {
    return shootingStars.current.map((progress, index) => {
      const startY = Math.random() * SCREEN_HEIGHT * 0.6;
      return (
        <Animated.View
          key={`shooting-star-${index}`}
          style={[
            styles.shootingStar,
            {
              top: startY,
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, SCREEN_WIDTH + 50],
                  }),
                },
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 150],
                  }),
                },
                {
                  rotate: '15deg',
                },
              ],
              opacity: progress.interpolate({
                inputRange: [0, 0.1, 0.9, 1],
                outputRange: [0, 1, 1, 0],
              }),
            },
          ]}
        >
          <View style={styles.shootingStarTail} />
        </Animated.View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.backgroundContainer, {
        opacity: backgroundPulse.current.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        })
      }]}>
        <LinearGradient
          colors={['#0A0A1A', '#1A1A3A', '#2A1A4A', '#1A2A4A']}
          locations={[0, 0.4, 0.7, 1]}
          style={styles.gradient}
        />
      </Animated.View>
      
      {renderStarLayer(tinyStars.current, STAR_SIZES.tiny, 'tiny')}
      {renderStarLayer(smallStars.current, STAR_SIZES.small, 'small')}
      {renderStarLayer(mediumStars.current, STAR_SIZES.medium, 'medium')}
      {renderStarLayer(largeStars.current, STAR_SIZES.large, 'large')}
      {renderStarLayer(particles.current, STAR_SIZES.particles, 'particles')}
      {enableShootingStars && renderShootingStars()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  backgroundContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  star: {
    position: 'absolute',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  shootingStar: {
    position: 'absolute',
    width: 60,
    height: 1.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    shadowColor: '#FFFFFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
  shootingStarTail: {
    position: 'absolute',
    left: -30,
    top: 0,
    width: 30,
    height: 1.5,
    backgroundColor: '#FFFFFF',
    opacity: 0.5,
    borderRadius: 1,
  },
});

export default SpaceBackground; 