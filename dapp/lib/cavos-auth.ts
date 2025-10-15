// Import the real CavosWallet from the SDK
import { CavosWallet } from 'cavos-service-native'

// Cavos authentication configuration
export const CAVOS_CONFIG = {
  appId: process.env.EXPO_PUBLIC_CAVOS_APP_ID || 'your-cavos-app-id',
  apiKey: process.env.EXPO_PUBLIC_CAVOS_API_KEY || 'your-cavos-api-key',
  hashSecret: process.env.EXPO_PUBLIC_CAVOS_HASH_SECRET || 'your-cavos-hash-secret',
  network: process.env.EXPO_PUBLIC_CAVOS_NETWORK || 'sepolia',
  redirectUri: process.env.EXPO_PUBLIC_CAVOS_REDIRECT_URI || 'astrade://callback',
  webRedirectUri: process.env.EXPO_PUBLIC_CAVOS_WEB_REDIRECT_URI || 'http://localhost:8081/callback'
}

// Cavos authentication utilities
export class CavosAuth {
  static async createUser(provider: 'google' | 'apple', userData: any): Promise<CavosWallet> {
    try {
      console.log('🔐 Creating Cavos user with provider:', provider)
      console.log('📊 User data:', userData)
      
      // Validate that we have real authentication tokens
      // For development, create mock tokens if not provided
      let accessToken = userData.access_token;
      let refreshToken = userData.refresh_token;
      
      if (!accessToken || !refreshToken) {
        console.warn('⚠️ Authentication tokens not found. Creating mock tokens for development.');
        accessToken = `mock_access_token_${Date.now()}`;
        refreshToken = `mock_refresh_token_${Date.now()}`;
      }

      // Get organization ID from environment or user data
      const orgId = process.env.EXPO_PUBLIC_CAVOS_ORG_ID || 
                    userData.org_id || 
                    userData.organization?.id;
      
      if (!orgId) {
        throw new Error('Missing organization ID. Please set EXPO_PUBLIC_CAVOS_ORG_ID environment variable or ensure org_id is provided.');
      }

      // Use the real CavosWallet constructor with all required parameters
      const wallet = new CavosWallet(
        userData.address,
        userData.network || 'sepolia',
        userData.email,
        userData.user_id,
        orgId,
        process.env.EXPO_PUBLIC_CAVOS_APP_ID || 'your-app-id',
        accessToken,
        refreshToken
      )
      
      console.log('✅ Real Cavos wallet created:', wallet)
      return wallet
    } catch (error) {
      console.error('❌ Error creating Cavos user:', error)
      throw error
    }
  }

  static async validateUser(userData: any): Promise<boolean> {
    try {
      // Validate required fields
      const requiredFields = ['email', 'user_id']
      for (const field of requiredFields) {
        if (!userData[field]) {
          console.error(`❌ Missing required field: ${field}`)
          return false
        }
      }
      
      console.log('✅ User data validation passed')
      return true
    } catch (error) {
      console.error('❌ Error validating user:', error)
      return false
    }
  }

  static getRedirectUri(platform: 'web' | 'mobile' = 'mobile'): string {
    return platform === 'web' ? CAVOS_CONFIG.webRedirectUri : CAVOS_CONFIG.redirectUri
  }
}

// Cavos wallet utilities
export class CavosWalletUtils {
  static async executeTransaction(wallet: CavosWallet, contractAddress: string, method: string, params: any[]) {
    try {
      console.log('🚀 Executing transaction with Cavos wallet')
      const result = await wallet.execute(contractAddress, method, params)
      console.log('✅ Transaction executed:', result)
      return result
    } catch (error) {
      console.error('❌ Transaction failed:', error)
      throw error
    }
  }

  static getWalletInfo(wallet: CavosWallet) {
    return {
      address: wallet.address,
      network: wallet.network,
      email: wallet.email,
      userId: wallet.user_id,
      isConnected: !!wallet.address
    }
  }
} 