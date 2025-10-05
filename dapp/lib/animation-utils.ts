import { Animated } from 'react-native';

/**
 * Configuración de animaciones optimizada para React Native Web
 * Todas las animaciones usan useNativeDriver: false para compatibilidad con web
 */

export const animationConfig = {
  // Configuración base para todas las animaciones
  base: {
    useNativeDriver: false,
  },
  
  // Configuración para animaciones de entrada
  entrance: {
    useNativeDriver: false,
    tension: 100,
    friction: 8,
  },
  
  // Configuración para animaciones de salida
  exit: {
    useNativeDriver: false,
    duration: 300,
  },
  
  // Configuración para animaciones de pulso
  pulse: {
    useNativeDriver: false,
    duration: 1000,
  },
  
  // Configuración para animaciones de rotación
  rotation: {
    useNativeDriver: false,
    duration: 2000,
  },
};

/**
 * Animación de entrada con escala y deslizamiento
 */
export const createEntranceAnimation = (
  scaleAnim: Animated.Value,
  slideAnim: Animated.Value
) => {
  return Animated.parallel([
    Animated.spring(scaleAnim, {
      toValue: 1,
      ...animationConfig.entrance,
    }),
    Animated.spring(slideAnim, {
      toValue: 0,
      ...animationConfig.entrance,
    }),
  ]);
};

/**
 * Animación de salida con escala y deslizamiento
 */
export const createExitAnimation = (
  scaleAnim: Animated.Value,
  slideAnim: Animated.Value,
  onComplete?: () => void
) => {
  return Animated.parallel([
    Animated.timing(scaleAnim, {
      toValue: 0,
      ...animationConfig.exit,
    }),
    Animated.timing(slideAnim, {
      toValue: -200,
      ...animationConfig.exit,
    }),
  ]).start(onComplete);
};

/**
 * Animación de pulso para indicadores
 */
export const createPulseAnimation = (pulseAnim: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        ...animationConfig.pulse,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        ...animationConfig.pulse,
      }),
    ])
  );
};

/**
 * Animación de rotación para iconos
 */
export const createRotationAnimation = (rotateAnim: Animated.Value) => {
  return Animated.loop(
    Animated.timing(rotateAnim, {
      toValue: 1,
      ...animationConfig.rotation,
    })
  );
};

/**
 * Animación de recompensa reclamada
 */
export const createRewardClaimedAnimation = (rewardAnim: Animated.Value) => {
  return Animated.sequence([
    Animated.timing(rewardAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }),
    Animated.timing(rewardAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }),
  ]);
}; 