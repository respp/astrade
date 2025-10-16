import React from 'react'
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import * as Crypto from 'expo-crypto'
import { secureStorage } from './secure-storage'

// Mock AuthData interface matching the tutorial
export interface AuthData {
  accessToken: string
  refreshToken: string
  expiresIn: number
  timestamp: number
  user_id: string
  email: string
  org_id: string
}

// Mock CavosWallet class following the tutorial API
export class CavosWallet {
  private address: string
  private network: string
  private email: string
  private user_id: string
  private org_id: string
  private orgSecret: string
  private accessToken?: string | null
  private refreshToken?: string | null
  private tokenExpiry?: number | null

  constructor(
    address: string,
    network: string,
    email: string,
    user_id: string,
    org_id: string,
    orgSecret: string,
    accessToken?: string | null,
    refreshToken?: string | null,
    tokenExpiry?: number | null
  ) {
    console.log('🏗️ [CavosWallet] Constructor called with:', {
      address,
      network,
      email,
      user_id,
      org_id,
      accessToken: !!accessToken,
      refreshToken: !!refreshToken,
      tokenExpiry
    })
    
    this.address = address
    this.network = network
    this.email = email
    this.user_id = user_id
    this.org_id = org_id
    this.orgSecret = orgSecret
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    this.tokenExpiry = tokenExpiry
    
    console.log('🏗️ [CavosWallet] Instance created with tokens:', {
      hasAccessToken: !!this.accessToken,
      hasRefreshToken: !!this.refreshToken,
      tokenExpiry: this.tokenExpiry
    })
  }

  async setAuthenticationData(authData: AuthData): Promise<void> {
    try {
      await secureStorage.setItemAsync('cavos_auth_data', JSON.stringify(authData))
      this.accessToken = authData.accessToken
      this.refreshToken = authData.refreshToken
      this.tokenExpiry = authData.expiresIn
    } catch (error) {
      console.error('Failed to store authentication data:', error)
      throw error
    }
  }

  async loadStoredAuthData(): Promise<boolean> {
    try {
      const storedData = await secureStorage.getItemAsync('cavos_auth_data')
      if (storedData) {
        const authData: AuthData = JSON.parse(storedData)
        this.accessToken = authData.accessToken
        this.refreshToken = authData.refreshToken
        this.tokenExpiry = authData.expiresIn
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to load stored auth data:', error)
      return false
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      console.log('🔍 [CavosWallet] Checking authentication status...')
      
      if (!this.accessToken) {
        console.log('🔍 [CavosWallet] No access token in memory, loading from storage...')
        await this.loadStoredAuthData()
      }
      
      console.log('🔍 [CavosWallet] Auth state:', {
        hasAccessToken: !!this.accessToken,
        hasTokenExpiry: !!this.tokenExpiry,
        tokenExpiry: this.tokenExpiry
      })
      
      if (!this.accessToken || !this.tokenExpiry) {
        console.log('❌ [CavosWallet] No token or expiry found')
        return false
      }

      // Check if token is still valid
      const now = Date.now()
      const storedData = await secureStorage.getItemAsync('cavos_auth_data')
      
      if (!storedData) {
        console.log('❌ [CavosWallet] No stored auth data')
        return false
      }
      
      const authData: AuthData = JSON.parse(storedData)
      console.log('🔍 [CavosWallet] Stored auth data:', {
        timestamp: authData.timestamp,
        expiresIn: authData.expiresIn,
        age: now - authData.timestamp,
        ageInSeconds: Math.floor((now - authData.timestamp) / 1000),
        expiresInSeconds: authData.expiresIn
      })
      
      const tokenAge = now - authData.timestamp
      const tokenValidDuration = authData.expiresIn * 1000 // Convert to milliseconds
      const isValid = tokenAge < tokenValidDuration
      
      console.log(isValid ? '✅ [CavosWallet] Token is valid' : '❌ [CavosWallet] Token expired')
      return isValid
    } catch (error) {
      console.error('❌ [CavosWallet] Failed to check authentication status:', error)
      return false
    }
  }

  async execute(contractAddress: string, entryPoint: string, calldata: any[]): Promise<any> {
    // Mock transaction execution
    console.log('Mock executing transaction:', { contractAddress, entryPoint, calldata })
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Return mock transaction result
    return {
      transaction_hash: '0x' + Crypto.getRandomBytes(32).reduce((str: string, byte: number) => str + byte.toString(16).padStart(2, '0'), ''),
      status: 'success',
      gas_used: '21000',
      block_number: Math.floor(Math.random() * 1000000) + 15000000
    }
  }

  async executeCalls(calls: any[]): Promise<any> {
    // Mock batch execution
    console.log('Mock executing batch calls:', calls)
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    return {
      transaction_hash: '0x' + Crypto.getRandomBytes(32).reduce((str: string, byte: number) => str + byte.toString(16).padStart(2, '0'), ''),
      status: 'success',
      gas_used: (calls.length * 21000).toString(),
      block_number: Math.floor(Math.random() * 1000000) + 15000000
    }
  }

  async swap(amount: number, sellTokenAddress: string, buyTokenAddress: string): Promise<any> {
    // Mock swap execution
    console.log('Mock executing swap:', { amount, sellTokenAddress, buyTokenAddress })
    
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    return {
      transaction_hash: '0x' + Crypto.getRandomBytes(32).reduce((str: string, byte: number) => str + byte.toString(16).padStart(2, '0'), ''),
      status: 'success',
      amount_in: amount,
      amount_out: amount * 0.998, // Mock 0.2% slippage
      gas_used: '150000'
    }
  }

  getWalletInfo() {
    return {
      address: this.address,
      network: this.network,
      email: this.email,
      user_id: this.user_id,
      org_id: this.org_id
    }
  }

  toJSON() {
    return {
      address: this.address,
      network: this.network,
      email: this.email,
      user_id: this.user_id,
      org_id: this.org_id,
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      tokenExpiry: this.tokenExpiry
    }
  }

  async logout(): Promise<void> {
    try {
      await secureStorage.deleteItemAsync('cavos_auth_data')
      this.accessToken = null
      this.refreshToken = null
      this.tokenExpiry = null
    } catch (error) {
      console.error('Failed to logout:', error)
      throw error
    }
  }
}

// Mock SignInWithApple component props
interface SignInProps {
  orgToken: string
  network: string
  finalRedirectUri: string
  children?: React.ReactNode
  style?: any
  textStyle?: any
  onSuccess?: (wallet: CavosWallet) => void
  onError?: (error: any) => void
}

// Mock SignInWithApple component
export const SignInWithApple: React.FC<SignInProps> = ({
  orgToken,
  network,
  finalRedirectUri,
  children,
  style,
  textStyle,
  onSuccess,
  onError
}) => {
  const handleSignIn = async () => {
    try {
      // Mock Apple Sign In flow
      console.log('Mock Apple Sign In initiated')
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock user data from Apple Sign In
      const mockUserData = {
        wallet: {
          address: '0x' + Crypto.getRandomBytes(20).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), ''),
          network: network
        },
        email: 'user@example.com',
        user_id: 'apple_' + Crypto.getRandomBytes(8).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), ''),
        org_id: 'org_' + Crypto.getRandomBytes(8).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), ''),
        access_token: 'mock_access_token_' + Crypto.getRandomBytes(16).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), ''),
        refresh_token: 'mock_refresh_token_' + Crypto.getRandomBytes(16).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), ''),
        expires_in: 3600
      }

      // Create CavosWallet instance
      const wallet = new CavosWallet(
        mockUserData.wallet.address,
        mockUserData.wallet.network,
        mockUserData.email,
        mockUserData.user_id,
        mockUserData.org_id,
        orgToken,
        mockUserData.access_token,
        mockUserData.refresh_token,
        mockUserData.expires_in
      )

      // Store authentication data
      await wallet.setAuthenticationData({
        accessToken: mockUserData.access_token,
        refreshToken: mockUserData.refresh_token,
        expiresIn: mockUserData.expires_in,
        timestamp: Date.now(),
        user_id: mockUserData.user_id,
        email: mockUserData.email,
        org_id: mockUserData.org_id
      })

      onSuccess?.(wallet)
    } catch (error) {
      console.error('Mock Apple Sign In failed:', error)
      onError?.(error)
    }
  }

  return (
    <TouchableOpacity style={[styles.signInButton, style]} onPress={handleSignIn}>
      {children || <Text style={[styles.signInText, textStyle]}>Sign in with Apple</Text>}
    </TouchableOpacity>
  )
}

// Mock SignInWithGoogle component
export const SignInWithGoogle: React.FC<SignInProps> = ({
  orgToken,
  network,
  finalRedirectUri,
  children,
  style,
  textStyle,
  onSuccess,
  onError
}) => {
  const handleSignIn = async () => {
    try {
      // Mock Google Sign In flow
      console.log('Mock Google Sign In initiated')
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock user data from Google Sign In
      const mockUserData = {
        wallet: {
          address: '0x' + Crypto.getRandomBytes(20).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), ''),
          network: network
        },
        email: 'user@gmail.com',
        user_id: 'google_' + Crypto.getRandomBytes(8).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), ''),
        org_id: 'org_' + Crypto.getRandomBytes(8).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), ''),
        access_token: 'mock_access_token_' + Crypto.getRandomBytes(16).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), ''),
        refresh_token: 'mock_refresh_token_' + Crypto.getRandomBytes(16).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), ''),
        expires_in: 3600
      }

      // Create CavosWallet instance
      const wallet = new CavosWallet(
        mockUserData.wallet.address,
        mockUserData.wallet.network,
        mockUserData.email,
        mockUserData.user_id,
        mockUserData.org_id,
        orgToken,
        mockUserData.access_token,
        mockUserData.refresh_token,
        mockUserData.expires_in
      )

      // Store authentication data
      await wallet.setAuthenticationData({
        accessToken: mockUserData.access_token,
        refreshToken: mockUserData.refresh_token,
        expiresIn: mockUserData.expires_in,
        timestamp: Date.now(),
        user_id: mockUserData.user_id,
        email: mockUserData.email,
        org_id: mockUserData.org_id
      })

      onSuccess?.(wallet)
    } catch (error) {
      console.error('Mock Google Sign In failed:', error)
      onError?.(error)
    }
  }

  return (
    <TouchableOpacity style={[styles.signInButton, style]} onPress={handleSignIn}>
      {children || <Text style={[styles.signInText, textStyle]}>Sign in with Google</Text>}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  signInButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    margin: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  signInText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
}) 