import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { secureStorage } from '../lib/secure-storage'
import { accountService, CreateUserResponse, CreateUserRequest } from '../lib/api/services/account'
import { ApiError } from '../lib/api/client'
import { CavosWallet } from 'cavos-service-native'

interface AuthContextType {
  userId: string | null // Cavos user ID
  backendUserId: string | null // Backend user ID
  cavosWallet: CavosWallet | null
  loading: boolean
  authenticated: boolean
  createUser: (provider: 'apple' | 'google', userData?: any) => Promise<{ success: boolean; error?: string }>
  setWallet: (wallet: CavosWallet) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

const USER_ID_KEY = 'astrade_user_id'
const BACKEND_USER_ID_KEY = 'astrade_backend_user_id'
const CAVOS_WALLET_KEY = 'astrade_cavos_wallet'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null) // Cavos user ID
  const [backendUserId, setBackendUserId] = useState<string | null>(null) // Backend user ID
  const [cavosWallet, setCavosWallet] = useState<CavosWallet | null>(null)
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  // Función para crear usuario en backend para usuarios Cavos existentes
  const createBackendUserForExistingCavosUser = useCallback(async (cavosUserId: string) => {
    try {
      console.log('🔄 Creating backend user for existing Cavos user:', cavosUserId);
      
      // Buscar información del wallet almacenado
      const storedWalletData = await secureStorage.getItemAsync(CAVOS_WALLET_KEY);
      if (!storedWalletData) {
        console.warn('⚠️ No wallet data found for backend user creation');
        return;
      }
      
      const walletInfo = JSON.parse(storedWalletData);
      console.log('📦 Using stored wallet info:', walletInfo);
      
      // Crear usuario en backend
      const createUserRequest = {
        provider: 'google' as const,
        email: walletInfo.email,
        cavos_user_id: cavosUserId,
        wallet_address: walletInfo.address
      };
      
      console.log('📤 Creating backend user with:', createUserRequest);
      const backendUser = await accountService.createUser(createUserRequest);
      
      if (backendUser && backendUser.user_id) {
        // Guardar el backendUserId
        await secureStorage.setItemAsync(BACKEND_USER_ID_KEY, backendUser.user_id);
        setBackendUserId(backendUser.user_id);
        accountService.setUserId(backendUser.user_id);
        console.log('✅ Successfully created and stored backend user ID:', backendUser.user_id);
      }
    } catch (error) {
      console.error('❌ Failed to create backend user for existing Cavos user:', error);
    }
  }, []);

  // Check if user already exists in storage
  const checkExistingUser = useCallback(async () => {
    try {
      setLoading(true)
      const storedCavosUserId = await secureStorage.getItemAsync(USER_ID_KEY)
      const storedBackendUserId = await secureStorage.getItemAsync(BACKEND_USER_ID_KEY)
      const storedWalletData = await secureStorage.getItemAsync(CAVOS_WALLET_KEY)
      
      console.log('🔍 Checking stored user data:', {
        storedCavosUserId,
        storedBackendUserId,
        hasWalletData: !!storedWalletData
      })
      
      if (storedCavosUserId) {
        setUserId(storedCavosUserId)
        setAuthenticated(true)
        
        if (storedBackendUserId) {
          setBackendUserId(storedBackendUserId)
          // Set backend user ID in API client for future requests
          accountService.setUserId(storedBackendUserId)
          console.log('✅ Found stored backend user ID:', storedBackendUserId)
        } else {
          console.warn('⚠️ No stored backend user ID found');
          
          // Intentar crear el usuario en el backend si tenemos cavosUserId
          if (storedCavosUserId) {
            console.log('🔄 Attempting to create backend user for existing Cavos user...');
            createBackendUserForExistingCavosUser(storedCavosUserId);
          }
        }
        
        console.log('✅ Found existing Cavos user:', storedCavosUserId)
      }
      
      if (storedWalletData) {
        try {
          const walletInfo = JSON.parse(storedWalletData)
          console.log('✅ Found stored wallet info:', walletInfo)
          
          // Create a CavosWallet instance from stored data
          const restoredWallet = {
            address: walletInfo.address,
            network: walletInfo.network,
            email: walletInfo.email,
            user_id: walletInfo.userId,
            org_id: walletInfo.orgId,
            execute: async (contractAddress: string, method: string, params: any[]) => {
              console.log('Executing transaction:', { contractAddress, method, params })
              return { success: true, hash: 'mock-hash' }
            }
          } as any
          
          setCavosWallet(restoredWallet)
          console.log('✅ Restored CavosWallet instance from storage')
          
          // IMPORTANTE: Si no hay storedCavosUserId pero sí hay wallet data, usar el userId del wallet
          if (!storedCavosUserId && walletInfo.userId) {
            console.log('🔄 Setting userId from restored wallet:', walletInfo.userId)
            setUserId(walletInfo.userId)
            setAuthenticated(true)
            
            // También intentar obtener el backend user ID si existe
            try {
              const backendUser = await accountService.getUserByCavosId(walletInfo.userId)
              if (backendUser && backendUser.user_id) {
                setBackendUserId(backendUser.user_id)
                accountService.setUserId(backendUser.user_id)
                await secureStorage.setItemAsync(BACKEND_USER_ID_KEY, backendUser.user_id)
                console.log('✅ Found and restored backend user ID:', backendUser.user_id)
              }
            } catch (error) {
              console.log('⚠️ No backend user found for restored wallet')
            }
          }
        } catch (error) {
          console.log('⚠️ Could not parse stored wallet data:', error)
        }
      }
    } catch (error) {
      console.error('Error checking existing user:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkExistingUser()
  }, [checkExistingUser])

  // Create user in backend after Cavos authentication
  const createUser = useCallback(async (provider: 'apple' | 'google', userData?: any): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true)
      
      // Extract Cavos wallet data - handle both address and wallet_address
      if (!userData || !userData.user_id || !userData.email) {
        console.error('❌ Missing required Cavos wallet data:', userData)
        return { success: false, error: 'Missing wallet authentication data' }
      }
      
      // Check for either address or wallet_address
      const walletAddress = userData.address || userData.wallet_address
      if (!walletAddress) {
        console.error('❌ Missing wallet address:', userData)
        return { success: false, error: 'Missing wallet address' }
      }
      
      const cavosUserId = userData.user_id
      const email = userData.email
      
      console.log('📱 Cavos authentication successful:', {
        provider,
        cavosUserId,
        walletAddress,
        email
      })
      
      // Step 1: Check if user already exists in backend
      console.log('🔍 Checking if user exists in backend...')
      let backendUser = await accountService.getUserByCavosId(cavosUserId)
      
      if (backendUser) {
        console.log('✅ User already exists in backend:', backendUser)
      } else {
        console.log('🚀 User not found, creating new user in backend...')
        
        // Step 2: Create user in backend
        const createUserRequest: CreateUserRequest = {
          provider,
          email,
          cavos_user_id: cavosUserId,
          wallet_address: walletAddress
        }
        
        try {
          console.log('📤 Sending user creation request:', createUserRequest)
          backendUser = await accountService.createUser(createUserRequest)
          console.log('✅ User created in backend:', backendUser)
        } catch (createError) {
          console.error('❌ Failed to create user in backend:', createError)
          if (createError instanceof ApiError) {
            return { success: false, error: `Backend registration failed: ${createError.message}` }
          }
          return { success: false, error: 'Failed to register user in backend' }
        }
      }
      
      // Step 3: Store both IDs securely
      await secureStorage.setItemAsync(USER_ID_KEY, cavosUserId)
      if (backendUser && backendUser.user_id) {
        await secureStorage.setItemAsync(BACKEND_USER_ID_KEY, backendUser.user_id)
        setBackendUserId(backendUser.user_id)
        // Configure API client for backend requests
        accountService.setUserId(backendUser.user_id)
        console.log('💾 Stored backend user ID:', backendUser.user_id)
      }
      
      // Step 4: Update state
      setUserId(cavosUserId)
      setAuthenticated(true)
      
      console.log('🎉 Authentication complete:', {
        cavosUserId,
        backendUserId: backendUser?.user_id,
        provider,
        email
      })
      
      return { success: true }
    } catch (error) {
      console.error('💥 Authentication error:', error)
      
      let errorMessage = 'Authentication failed'
      if (error instanceof ApiError) {
        errorMessage = `Backend error: ${error.message}`
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Set Cavos wallet (called after successful authentication)
  const setWallet = useCallback(async (wallet: CavosWallet) => {
    console.log('✅ Setting Cavos wallet in context:', wallet.address)
    console.log('Wallet details:', {
      address: wallet.address,
      network: wallet.network,
      email: wallet.email,
      user_id: wallet.user_id,
      org_id: (wallet as any).org_id
    })
    
    setCavosWallet(wallet)
    
    // Store the user ID first - this is what checkExistingUser looks for
    await secureStorage.setItemAsync(USER_ID_KEY, wallet.user_id)
    setUserId(wallet.user_id)
    
    // Store basic wallet info for reference
    const walletInfo = {
      address: wallet.address,
      network: wallet.network,
      email: wallet.email,
      userId: wallet.user_id,
      orgId: (wallet as any).org_id
    }
    await secureStorage.setItemAsync(CAVOS_WALLET_KEY, JSON.stringify(walletInfo))
    
    // IMPORTANTE: También guardar el userId por separado
    if (wallet.user_id) {
      secureStorage.setItemAsync(USER_ID_KEY, wallet.user_id)
      setUserId(wallet.user_id)
      console.log('💾 Stored Cavos user ID:', wallet.user_id)
    }
    
    // Mark as authenticated
    setAuthenticated(true)
    
    console.log('✅ Authentication state persisted successfully')
  }, [])

  // Sign out from both systems
  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      
      // Clear stored data
      await secureStorage.deleteItemAsync(USER_ID_KEY)
      await secureStorage.deleteItemAsync(BACKEND_USER_ID_KEY)
      await secureStorage.deleteItemAsync(CAVOS_WALLET_KEY)
      
      // Clear API client user ID
      accountService.setUserId('')
      
      // Update state
      setUserId(null)
      setBackendUserId(null)
      setCavosWallet(null)
      setAuthenticated(false)
      
      console.log('✅ Signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Refresh user (re-check stored user)
  const refreshUser = useCallback(async () => {
    await checkExistingUser()
  }, [checkExistingUser])

  const value = {
    userId,
    backendUserId,
    cavosWallet,
    loading,
    authenticated: authenticated || !!userId,
    createUser,
    setWallet,
    signOut,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 