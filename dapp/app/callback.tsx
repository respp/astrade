import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useAuth } from '../contexts/AuthContext'
import { CavosWallet } from 'cavos-service-native'

export default function CallbackScreen() {
  const router = useRouter()
  const searchParams = useLocalSearchParams()
  const { createUser, setWallet } = useAuth()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔗 Callback screen mounted with params:', searchParams);
        
        // Get user data from URL parameters - handle both direct params and nested user_data
        let userData = searchParams.user_data as string;
        
        // If no user_data, check for other potential parameter names
        if (!userData) {
          // Check all params to see if any contain user data
          console.log('🔍 No user_data param found, checking all params:', searchParams);
          
          // Sometimes the entire URL gets passed as a single param
          const allParams = Object.values(searchParams);
          for (const param of allParams) {
            if (typeof param === 'string' && param.includes('user_data')) {
              console.log('📍 Found user_data in param:', param);
              try {
                const url = new URL(param.startsWith('http') ? param : `https://example.com/${param}`);
                userData = url.searchParams.get('user_data') || '';
                break;
              } catch (e) {
                console.log('⚠️ Failed to parse param as URL:', e);
              }
            }
          }
        }
        
        if (userData) {
          console.log('✅ Authentication callback received')
          console.log('User data string length:', userData.length)
          
          // Parse the user data (it's URL encoded)
          const decodedData = decodeURIComponent(userData)
          console.log('📊 Decoded data length:', decodedData.length)
          
          const userDataObj = JSON.parse(decodedData)
          console.log('✅ Parsed user data:', {
            hasWallet: !!userDataObj.wallet,
            hasEmail: !!userDataObj.email,
            hasUserId: !!userDataObj.user_id,
            walletAddress: userDataObj.wallet?.address?.substring(0, 10) + '...'
          })
          
          setStatus('Creating your wallet...')
          
          // Create CavosWallet instance from the user data
          const wallet: CavosWallet = {
            address: userDataObj.wallet.address,
            network: userDataObj.wallet.network,
            email: userDataObj.email,
            user_id: userDataObj.user_id,
            org_id: userDataObj.org_id,
            accessToken: userDataObj.authData?.accessToken,
            refreshToken: userDataObj.authData?.refreshToken,
            tokenExpiry: userDataObj.authData ? userDataObj.authData.timestamp + userDataObj.authData.expiresIn * 1000 : Date.now() + 3600000,
            execute: async (contractAddress: string, method: string, params: any[]) => {
              console.log('Executing transaction:', { contractAddress, method, params })
              // This would use the real Cavos SDK to execute transactions
              return { success: true, hash: 'mock-hash-' + Date.now() }
            }
          } as any
          
          console.log('✅ Created CavosWallet instance:', {
            address: wallet.address,
            network: wallet.network,
            email: wallet.email,
            user_id: wallet.user_id
          })
          
          // Set the wallet in auth context and wait for completion
          await setWallet(wallet)
          console.log('✅ Wallet stored in auth context successfully')
          
          setStatus('Creating your trading account...')
          
          // Try to create trading user in backend
          try {
            console.log('👤 Creating user in backend...')
            const response = await createUser('google', {
              user_id: userDataObj.user_id,
              email: userDataObj.email,
              wallet_address: userDataObj.wallet.address,
              network: userDataObj.wallet.network
            })
            
            if (response.success) {
              console.log('✅ Backend user created successfully')
              setStatus('Trading account created successfully!')
            } else {
              console.log('⚠️ Backend user creation failed:', response.error)
              setStatus('Authentication successful, but trading account setup failed')
            }
          } catch (backendError) {
            console.log('⚠️ Backend not available:', backendError)
            setStatus('Authentication successful, but backend is not available')
          }
          
          setStatus('Authentication successful!')
          
          // Navigate to main app after authentication is fully complete
          setTimeout(() => {
            console.log('🚀 Navigating to main app after successful authentication...')
            router.replace('/(tabs)')
          }, 1000) // Increased timeout to ensure storage completion
          
        } else {
          setStatus('No authentication data received')
          console.error('❌ No user_data parameter found in:', searchParams)
          
          // Try to redirect back to login after a delay
          setTimeout(() => {
            console.log('🔄 Redirecting back to login...')
            router.replace('/login')
          }, 3000)
        }
      } catch (error) {
        console.error('❌ Callback error:', error)
        setStatus('Authentication failed - ' + (error instanceof Error ? error.message : 'Unknown error'))
        
        // Redirect back to login after error
        setTimeout(() => {
          console.log('🔄 Redirecting to login after error...')
          router.replace('/login')
        }, 3000)
      }
    }

    // Add a small delay to ensure params are properly received
    const timeoutId = setTimeout(() => {
      handleCallback()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [searchParams, router, createUser, setWallet])

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#8B5CF6" />
      <Text style={styles.status}>{status}</Text>
      <Text style={styles.subtitle}>
        Please wait while we complete your authentication...
      </Text>
      
      {/* Debug info for development */}
      {__DEV__ && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            Debug: {Object.keys(searchParams).length} params received
          </Text>
          <Text style={styles.debugText}>
            Platform: {Platform.OS}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F23',
    padding: 20,
  },
  status: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  debugContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
}) 