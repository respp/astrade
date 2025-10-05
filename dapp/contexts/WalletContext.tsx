import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { CavosWallet } from 'cavos-service-native'
import { secureStorage } from '@/lib/secure-storage'

// Tipos de error específicos para mejor manejo
enum WalletError {
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
  INVALID_WALLET = 'INVALID_WALLET',
  STORAGE_ERROR = 'STORAGE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

interface WalletContextType {
  wallet: CavosWallet | null
  isAuthenticated: boolean
  loading: boolean
  error: WalletError | null
  reconnecting: boolean
  login: (wallet: CavosWallet) => Promise<void>
  logout: () => Promise<void>
  executeTransaction: (contractAddress: string, entryPoint: string, calldata: any[]) => Promise<any>
  executeBatch: (calls: any[]) => Promise<any>
  swapTokens: (amount: number, sellToken: string, buyToken: string) => Promise<any>
  reconnect: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

const RECONNECT_INTERVAL = 5000 // 5 segundos entre intentos de reconexión

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<CavosWallet | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<WalletError | null>(null)
  const [reconnecting, setReconnecting] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)

  // Función de reconexión
  const reconnect = useCallback(async () => {
    console.log('🔄 Attempting wallet reconnection...')
    setReconnecting(true)
    setError(null)
    
    try {
      const storedData = await secureStorage.getItemAsync('cavos_auth_data')
      if (!storedData) {
        throw new Error('No stored wallet data found')
      }

      const authData = JSON.parse(storedData)
      console.log('📱 Found stored wallet data:', {
        address: authData.wallet_address,
        network: authData.network,
        userId: authData.user_id
      })

      // Verificar datos mínimos necesarios
      if (!authData.wallet_address || !authData.network || !authData.user_id) {
        throw new Error('Invalid stored wallet data')
      }

      // Intentar restaurar la wallet
      const restoredWallet = new CavosWallet(
        authData.wallet_address,
        authData.network,
        authData.email,
        authData.user_id,
        authData.org_id,
        process.env.EXPO_PUBLIC_CAVOS_APP_ID!
      )

      // Verificar que la wallet está activa
      const isValid = await restoredWallet.isAuthenticated()
      if (!isValid) {
        throw new Error('Wallet authentication failed')
      }

      setWallet(restoredWallet)
      setIsAuthenticated(true)
      setReconnectAttempts(0)
      console.log('✅ Wallet reconnection successful!')
      
    } catch (error) {
      console.error('❌ Reconnection failed:', error)
      setError(WalletError.NETWORK_ERROR)
      setReconnectAttempts(prev => prev + 1)
      
      // Intentar reconectar automáticamente hasta 3 veces
      if (reconnectAttempts < 3) {
        setTimeout(reconnect, RECONNECT_INTERVAL)
      } else {
        console.log('⚠️ Max reconnection attempts reached')
        setReconnecting(false)
      }
    }
  }, [reconnectAttempts])

  // Verificar estado de la wallet periódicamente
  useEffect(() => {
    let checkInterval: ReturnType<typeof setInterval>

    const checkWalletStatus = async () => {
      if (wallet && isAuthenticated) {
        try {
          const isValid = await wallet.isAuthenticated()
          if (!isValid && !reconnecting) {
            console.log('⚠️ Wallet connection lost, attempting reconnection...')
            reconnect()
          }
        } catch (error) {
          console.error('❌ Wallet status check failed:', error)
        }
      }
    }

    if (isAuthenticated) {
      checkInterval = setInterval(checkWalletStatus, 30000) // Verificar cada 30 segundos
    }

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval)
      }
    }
  }, [wallet, isAuthenticated, reconnecting, reconnect])

  // Verificar wallet almacenada al inicio
  useEffect(() => {
    checkStoredWallet()
  }, [])

  const checkStoredWallet = async () => {
    console.log('🔍 Checking stored wallet...')
    try {
      const storedData = await secureStorage.getItemAsync('cavos_auth_data')
      if (storedData) {
        const authData = JSON.parse(storedData)
        console.log('📱 Found stored wallet data')
        
        if (authData.wallet_address && authData.network && authData.user_id) {
          await reconnect()
        }
      } else {
        console.log('ℹ️ No stored wallet found')
      }
    } catch (error) {
      console.error('❌ Failed to check stored wallet:', error)
      setError(WalletError.STORAGE_ERROR)
    } finally {
      setLoading(false)
    }
  }

  const login = async (walletInstance: CavosWallet) => {
    console.log('🔐 Starting wallet login process...')
    try {
      // Validar la instancia de la wallet
      if (!walletInstance.address || !walletInstance.network) {
        console.error('❌ Invalid wallet instance')
        throw new Error(WalletError.INVALID_WALLET)
      }

      // Guardar datos de autenticación
      const authData = {
        wallet_address: walletInstance.address,
        network: walletInstance.network,
        email: walletInstance.email,
        user_id: walletInstance.user_id,
        org_id: walletInstance.org_id,
        timestamp: Date.now()
      }

      await secureStorage.setItemAsync('cavos_auth_data', JSON.stringify(authData))
      
      setWallet(walletInstance)
      setIsAuthenticated(true)
      setError(null)
      console.log('✅ Wallet login successful!')
      
    } catch (error) {
      console.error('❌ Login failed:', error)
      setError(error instanceof Error ? WalletError.INVALID_WALLET : WalletError.UNKNOWN_ERROR)
      throw error
    }
  }

  const logout = async () => {
    console.log('🔒 Starting wallet logout process...')
    try {
      if (wallet) {
        await wallet.logout()
      }
      await secureStorage.deleteItemAsync('cavos_auth_data')
      setWallet(null)
      setIsAuthenticated(false)
      setError(null)
      setReconnectAttempts(0)
      console.log('✅ Wallet logout successful!')
    } catch (error) {
      console.error('❌ Logout failed:', error)
      setError(WalletError.UNKNOWN_ERROR)
      throw error
    }
  }

  const executeTransaction = async (contractAddress: string, entryPoint: string, calldata: any[]) => {
    if (!wallet || !isAuthenticated) {
      throw new Error(WalletError.NOT_AUTHENTICATED)
    }
    
    console.log('📝 Executing transaction:', { contractAddress, entryPoint })
    try {
      const result = await wallet.execute(contractAddress, entryPoint, calldata)
      console.log('✅ Transaction successful:', result)
      return result
    } catch (error) {
      console.error('❌ Transaction failed:', error)
      setError(WalletError.NETWORK_ERROR)
      throw error
    }
  }

  const executeBatch = async (calls: any[]) => {
    if (!wallet || !isAuthenticated) {
      throw new Error(WalletError.NOT_AUTHENTICATED)
    }
    
    console.log('📝 Executing batch transaction:', { callsCount: calls.length })
    try {
      const result = await wallet.executeCalls(calls)
      console.log('✅ Batch transaction successful:', result)
      return result
    } catch (error) {
      console.error('❌ Batch transaction failed:', error)
      setError(WalletError.NETWORK_ERROR)
      throw error
    }
  }

  const swapTokens = async (amount: number, sellToken: string, buyToken: string) => {
    if (!wallet || !isAuthenticated) {
      throw new Error(WalletError.NOT_AUTHENTICATED)
    }
    
    console.log('💱 Executing token swap:', { amount, sellToken, buyToken })
    try {
      const result = await wallet.swap(amount, sellToken, buyToken)
      console.log('✅ Token swap successful:', result)
      return result
    } catch (error) {
      console.error('❌ Token swap failed:', error)
      setError(WalletError.NETWORK_ERROR)
      throw error
    }
  }

  const value = {
    wallet,
    isAuthenticated,
    loading,
    error,
    reconnecting,
    login,
    logout,
    executeTransaction,
    executeBatch,
    swapTokens,
    reconnect
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
} 