import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native'
import { CavosWallet } from 'cavos-service-native'

interface CavosAuthFallbackProps {
  onSuccess?: (wallet: CavosWallet) => void
  onError?: (error: any) => void
  style?: any
}

export default function CavosAuthFallback({ onSuccess, onError, style }: CavosAuthFallbackProps) {
  const [isLoading, setIsLoading] = useState(false)

  const createMockWallet = (provider: 'google' | 'apple') => {
    const mockWallet: CavosWallet = {
      address: '0x' + Math.random().toString(16).substr(2, 40),
      network: 'sepolia',
      email: `test-${provider}@example.com`,
      user_id: `${provider}_user_${Date.now()}`,
      org_id: '110',
      accessToken: `${provider}_token_${Date.now()}`,
      refreshToken: `${provider}_refresh_${Date.now()}`,
      tokenExpiry: Date.now() + 3600 * 1000,
      execute: async (contractAddress: string, method: string, params: any[]) => {
        console.log('Executing transaction:', { contractAddress, method, params })
        return { success: true, hash: 'mock-hash-' + Date.now() }
      }
    } as any

    return mockWallet
  }

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true)
      console.log('🚀 Starting Google authentication (fallback mode)...')
      
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const wallet = createMockWallet('google')
      console.log('✅ Google authentication successful (fallback):', wallet)
      
      if (onSuccess) {
        onSuccess(wallet)
      }
    } catch (error) {
      console.error('❌ Google authentication failed:', error)
      if (onError) {
        onError(error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAppleAuth = async () => {
    try {
      setIsLoading(true)
      console.log('🚀 Starting Apple authentication (fallback mode)...')
      
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const wallet = createMockWallet('apple')
      console.log('✅ Apple authentication successful (fallback):', wallet)
      
      if (onSuccess) {
        onSuccess(wallet)
      }
    } catch (error) {
      console.error('❌ Apple authentication failed:', error)
      if (onError) {
        onError(error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const showDebugInfo = () => {
    const info = {
      platform: Platform.OS,
      deepLinkWorking: false,
      fallbackMode: true,
      cavosAppId: process.env.EXPO_PUBLIC_CAVOS_APP_ID || 'NOT_SET',
      network: process.env.EXPO_PUBLIC_CAVOS_NETWORK || 'NOT_SET'
    }
    
    console.log('🔧 Fallback auth debug info:', info)
    Alert.alert(
      'Fallback Authentication Mode',
      `Platform: ${info.platform}\n` +
      `Deep Link Working: ${info.deepLinkWorking}\n` +
      `Fallback Mode: ${info.fallbackMode}\n` +
      `Cavos App ID: ${info.cavosAppId}\n` +
      `Network: ${info.network}\n\n` +
      `This mode creates mock wallets for testing without requiring deep links.`,
      [{ text: 'OK' }]
    )
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>🔄 Fallback Authentication</Text>
      <Text style={styles.subtitle}>
        Deep links not working. Using fallback mode for testing.
      </Text>
      
      <TouchableOpacity 
        style={[styles.button, styles.googleButton]} 
        onPress={handleGoogleAuth}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? '🔄 Authenticating...' : '🔍 Continue with Google (Fallback)'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.appleButton]} 
        onPress={handleAppleAuth}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? '🔄 Authenticating...' : '🍎 Continue with Apple (Fallback)'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.debugButton} onPress={showDebugInfo}>
        <Text style={styles.debugButtonText}>🔧 Show Debug Info</Text>
      </TouchableOpacity>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          ⚠️ This creates mock wallets for testing.{'\n'}
          For production, ensure deep links are working properly.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  appleButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  debugButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '500',
  },
  infoContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 6,
  },
  infoText: {
    color: '#B0B0B0',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
}) 