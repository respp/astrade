import { Platform } from 'react-native'

// Platform-aware secure storage
class SecureStorage {
  async setItemAsync(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Use localStorage on web
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value)
      } else {
        throw new Error('localStorage is not available')
      }
    } else {
      // Use SecureStore on native platforms
      const SecureStore = await import('expo-secure-store')
      await SecureStore.setItemAsync(key, value)
    }
  }

  async getItemAsync(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      // Use localStorage on web
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key)
      } else {
        return null
      }
    } else {
      // Use SecureStore on native platforms
      const SecureStore = await import('expo-secure-store')
      return await SecureStore.getItemAsync(key)
    }
  }

  async deleteItemAsync(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Use localStorage on web
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key)
      }
    } else {
      // Use SecureStore on native platforms
      const SecureStore = await import('expo-secure-store')
      await SecureStore.deleteItemAsync(key)
    }
  }
}

export const secureStorage = new SecureStorage() 