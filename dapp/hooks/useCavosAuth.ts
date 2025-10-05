import { useState, useCallback } from 'react'
import { CavosAuth, CAVOS_CONFIG } from '@/lib/cavos-auth'

// Cavos wallet type definition (since we don't have the actual SDK)
export interface CavosWallet {
  address: string
  network: string
  email: string
  user_id: string
  execute: (contractAddress: string, method: string, params: any[]) => Promise<any>
}

export const useCavosAuth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wallet, setWallet] = useState<CavosWallet | null>(null)

  const authenticate = useCallback(async (provider: 'google' | 'apple', userData: any) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔐 Starting Cavos authentication with:', provider)
      
      // Validate user data
      const isValid = await CavosAuth.validateUser(userData)
      if (!isValid) {
        throw new Error('Invalid user data')
      }
      
      // Create Cavos wallet
      const cavosWallet = await CavosAuth.createUser(provider, userData)
      
      setWallet(cavosWallet)
      console.log('✅ Cavos authentication successful')
      
      return { success: true, wallet: cavosWallet }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      setError(errorMessage)
      console.error('❌ Cavos authentication failed:', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(() => {
    setWallet(null)
    setError(null)
    console.log('🔓 Cavos user signed out')
  }, [])

  const getRedirectUri = useCallback((platform: 'web' | 'mobile' = 'mobile') => {
    return CavosAuth.getRedirectUri(platform)
  }, [])

  return {
    loading,
    error,
    wallet,
    authenticated: !!wallet,
    authenticate,
    signOut,
    getRedirectUri,
    config: CAVOS_CONFIG
  }
} 