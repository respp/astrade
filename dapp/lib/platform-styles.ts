import { Platform, ViewStyle, TextStyle } from 'react-native';

export interface ShadowConfig {
  color: string;
  opacity: number;
  radius: number;
  offsetX?: number;
  offsetY?: number;
  elevation?: number;
}

/**
 * Genera estilos de sombra compatibles con todas las plataformas
 */
export const createShadow = (config: ShadowConfig): ViewStyle => {
  const {
    color,
    opacity,
    radius,
    offsetX = 0,
    offsetY = 0,
    elevation = 5
  } = config;

  if (Platform.OS === 'web') {
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${radius}px rgba(${hexToRgb(color)}, ${opacity})`,
    } as ViewStyle;
  } else if (Platform.OS === 'android') {
    return {
      elevation,
      shadowColor: color,
    };
  } else {
    // iOS
    return {
      shadowColor: color,
      shadowOffset: { width: offsetX, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    };
  }
};

/**
 * Genera estilos de sombra de texto compatibles con todas las plataformas
 */
export const createTextShadow = (config: Omit<ShadowConfig, 'elevation'>): TextStyle => {
  const {
    color,
    opacity,
    radius,
    offsetX = 0,
    offsetY = 1
  } = config;

  if (Platform.OS === 'web') {
    return {
      textShadow: `${offsetX}px ${offsetY}px ${radius}px rgba(${hexToRgb(color)}, ${opacity})`,
    } as TextStyle;
  } else {
    // iOS/Android
    return {
      textShadowColor: color,
      textShadowOffset: { width: offsetX, height: offsetY },
      textShadowRadius: radius,
    };
  }
};

/**
 * Convierte color hex a valores RGB
 */
const hexToRgb = (hex: string): string => {
  // Remover # si existe
  hex = hex.replace('#', '');
  
  // Convertir de 3 a 6 caracteres si es necesario
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  return `${r}, ${g}, ${b}`;
};

/**
 * Obtiene el color RGB de colores comunes
 */
const getColorRgb = (color: string): string => {
  const colorMap: { [key: string]: string } = {
    '#8B5CF6': '139, 92, 246',
    '#10B981': '16, 185, 129',
    '#3B82F6': '59, 130, 246',
    '#EC4899': '236, 72, 153',
    '#F59E0B': '245, 158, 11',
    '#FBBF24': '251, 191, 36',
    '#000': '0, 0, 0',
    '#fff': '255, 255, 255',
    'rgba(0, 0, 0, 0.5)': '0, 0, 0',
  };

  return colorMap[color] || hexToRgb(color);
};

/**
 * Estilos de sombra predefinidos para componentes comunes
 */
export const shadowPresets = {
  small: {
    color: '#8B5CF6',
    opacity: 0.6,
    radius: 8,
    offsetY: 0,
    elevation: 5,
  },
  medium: {
    color: '#8B5CF6',
    opacity: 0.6,
    radius: 10,
    offsetY: 0,
    elevation: 8,
  },
  large: {
    color: '#8B5CF6',
    opacity: 0.8,
    radius: 20,
    offsetY: 0,
    elevation: 10,
  },
  card: {
    color: '#000',
    opacity: 0.3,
    radius: 8,
    offsetY: 4,
    elevation: 6,
  },
  text: {
    color: '#000',
    opacity: 0.5,
    radius: 2,
    offsetY: 1,
  },
  textLarge: {
    color: '#000',
    opacity: 0.5,
    radius: 6,
    offsetY: 2,
  },
};

/**
 * Hook para verificar si es web
 */
export const isWeb = Platform.OS === 'web';
export const isNative = Platform.OS !== 'web'; 