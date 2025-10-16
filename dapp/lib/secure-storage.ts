import { Platform } from 'react-native'

// Detectar si estamos en web de manera más robusta
const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined'

// Platform-aware secure storage
class SecureStorage {
  async setItemAsync(key: string, value: string): Promise<void> {
    console.log('🔐 [SecureStorage] setItemAsync called:', { key, isWeb, platform: Platform.OS })
    
    if (isWeb || Platform.OS === 'web') {
      // Use localStorage on web
      if (typeof window !== 'undefined' && window.localStorage) {
        console.log('🌐 [SecureStorage] Using localStorage for web')
        localStorage.setItem(key, value)
        console.log('✅ [SecureStorage] Data saved to localStorage')
      } else {
        throw new Error('localStorage is not available')
      }
    } else {
      // Use SecureStore on native platforms
      console.log('📱 [SecureStorage] Using SecureStore for native')
      const SecureStore = await import('expo-secure-store')
      await SecureStore.setItemAsync(key, value)
      console.log('✅ [SecureStorage] Data saved to SecureStore')
    }
  }

  async getItemAsync(key: string): Promise<string | null> {
    console.log('🔍 [SecureStorage] getItemAsync called:', { key, isWeb, platform: Platform.OS })
    
    if (isWeb || Platform.OS === 'web') {
      // Use localStorage on web
      if (typeof window !== 'undefined' && window.localStorage) {
        console.log('🌐 [SecureStorage] Reading from localStorage')
        const result = localStorage.getItem(key)
        console.log('📦 [SecureStorage] localStorage result:', result ? 'DATA FOUND' : 'NO DATA')
        return result
      } else {
        console.log('❌ [SecureStorage] localStorage not available')
        return null
      }
    } else {
      // Use SecureStore on native platforms
      console.log('📱 [SecureStorage] Reading from SecureStore')
      const SecureStore = await import('expo-secure-store')
      const result = await SecureStore.getItemAsync(key)
      console.log('📦 [SecureStorage] SecureStore result:', result ? 'DATA FOUND' : 'NO DATA')
      return result
    }
  }

  async deleteItemAsync(key: string): Promise<void> {
    console.log('🗑️ [SecureStorage] deleteItemAsync called:', { key, isWeb, platform: Platform.OS })
    
    if (isWeb || Platform.OS === 'web') {
      // Use localStorage on web
      if (typeof window !== 'undefined' && window.localStorage) {
        console.log('🌐 [SecureStorage] Deleting from localStorage')
        localStorage.removeItem(key)
        console.log('✅ [SecureStorage] Data deleted from localStorage')
      }
    } else {
      // Use SecureStore on native platforms
      console.log('📱 [SecureStorage] Deleting from SecureStore')
      const SecureStore = await import('expo-secure-store')
      await SecureStore.deleteItemAsync(key)
      console.log('✅ [SecureStorage] Data deleted from SecureStore')
    }
  }
}

export const secureStorage = new SecureStorage() 