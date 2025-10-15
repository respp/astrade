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
  },

  // Configuración de Dojo
  DOJO: {
    // Habilitar integración con Dojo
    ENABLED: process.env.EXPO_PUBLIC_DOJO_ENABLED === 'true' || false,
    
    // URLs de conexión
    RPC_URL: process.env.EXPO_PUBLIC_DOJO_RPC_URL || 'http://localhost:5050',
    TORII_URL: process.env.EXPO_PUBLIC_DOJO_TORII_URL || 'http://localhost:8080',
    
    // Configuración del mundo Dojo
    WORLD_ADDRESS: process.env.EXPO_PUBLIC_DOJO_WORLD_ADDRESS || '',
    NAMESPACE: process.env.EXPO_PUBLIC_DOJO_NAMESPACE || 'di',
    CHAIN_ID: process.env.EXPO_PUBLIC_DOJO_CHAIN_ID || '0x4b4154414e41', // "KATANA"
    
    // Auto-connect al iniciar sesión
    AUTO_CONNECT: true,
    
    // Reintentos de conexión
    MAX_RECONNECT_ATTEMPTS: 3,
    RECONNECT_INTERVAL_MS: 5000,
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

// Función para verificar si Dojo está habilitado
export const isDojoEnabled = () => {
  return CONFIG.DOJO.ENABLED && CONFIG.DOJO.WORLD_ADDRESS !== '';
};

// Función para obtener la configuración de Dojo
export const getDojoConfig = () => {
  return CONFIG.DOJO;
}; 