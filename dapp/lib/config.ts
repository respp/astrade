// Configuración de desarrollo para AsTrade
export const CONFIG = {
  // Habilitar modo mock para desarrollo sin backend
  MOCK_MODE: false, // Cambiar a false cuando el backend esté disponible
  
  // URL del backend
  BASE_URL: process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:8000',
  
  // Configuración de autenticación
  GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id',
  APPLE_CLIENT_ID: process.env.EXPO_PUBLIC_APPLE_CLIENT_ID || 'your-apple-client-id',
  
  // Configuración de recompensas
  REWARDS: {
    DAILY_STREAK_ENABLED: true,
    ACHIEVEMENTS_ENABLED: true,
    ACTIVITY_TRACKING_ENABLED: true
  }
};

// Función para verificar si estamos en modo desarrollo
export const isDevelopment = () => {
  return __DEV__ || CONFIG.MOCK_MODE;
};

// Función para obtener la configuración de mock
export const getMockConfig = () => {
  return {
    enabled: CONFIG.MOCK_MODE,
    delay: 1000, // Simular delay de red
    errorRate: 0, // 0% de errores en mock
  };
}; 