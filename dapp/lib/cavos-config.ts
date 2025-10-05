import Constants from 'expo-constants'

// CAVOS Configuration using environment variables
export const CAVOS_CONFIG = {
  apiKey: Constants.expoConfig?.extra?.EXPO_PUBLIC_CAVOS_API_KEY || process.env.EXPO_PUBLIC_CAVOS_API_KEY,
  hashSecret: Constants.expoConfig?.extra?.EXPO_PUBLIC_CAVOS_HASH_SECRET || process.env.EXPO_PUBLIC_CAVOS_HASH_SECRET,
  appId: Constants.expoConfig?.extra?.EXPO_PUBLIC_CAVOS_APP_ID || process.env.EXPO_PUBLIC_CAVOS_APP_ID,
  network: Constants.expoConfig?.extra?.EXPO_PUBLIC_CAVOS_NETWORK || process.env.EXPO_PUBLIC_CAVOS_NETWORK || 'mainnet',
  redirectUri: 'cavos://callback',
}

// Validate configuration
export const validateCavosConfig = () => {
  const required = ['apiKey', 'hashSecret', 'appId']
  const missing = required.filter(key => !CAVOS_CONFIG[key as keyof typeof CAVOS_CONFIG])
  
  if (missing.length > 0) {
    throw new Error(`Missing required Cavos configuration: ${missing.join(', ')}`)
  }
  
  return true
}

// Environment variables interface
export interface CavosEnvConfig {
  EXPO_PUBLIC_CAVOS_API_KEY?: string
  EXPO_PUBLIC_CAVOS_HASH_SECRET?: string
  EXPO_PUBLIC_CAVOS_APP_ID?: string
  EXPO_PUBLIC_CAVOS_NETWORK?: string
} 