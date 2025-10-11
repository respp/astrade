import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '../contexts/AuthContext'
import { router } from 'expo-router'
import { createShadow, shadowPresets } from '../lib/platform-styles'
import AppleSignIn from '../components/AppleSignIn'
import GoogleSignIn from '../components/GoogleSignIn'
import EmailSignIn from '../components/EmailSignIn'
import EmailSignUp from '../components/EmailSignUp'
import SpaceBackground from '../components/SpaceBackground'

import { CavosWallet } from 'cavos-service-native'

export default function LoginScreen() {
  const [loading, setLoading] = useState(false)
  const [authStep, setAuthStep] = useState<string>('')
  const [authMode, setAuthMode] = useState<'social' | 'email-login' | 'email-register'>('social')
  const { createUser, setWallet, signOut, authenticated, userId } = useAuth()
  const isProcessing = useRef(false)

  // Debug auth state
  useEffect(() => {
    console.log('🔍 Login Screen Auth State:', {
      authenticated,
      userId,
      loading,
      currentUrl: Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.href : 'mobile-app'
    })
  }, [authenticated, userId, loading])

  const handleAuthSuccess = async (wallet: CavosWallet) => {
    if (isProcessing.current) {
      console.log('⚠️ Already processing authentication, skipping...')
      return
    }

    try {
      isProcessing.current = true
      setLoading(true)
      setAuthStep('Setting up your trading account...')

      console.log('✅ Authentication successful!')
      console.log('Wallet address:', wallet.address)
      console.log('Network:', wallet.network)
      console.log('User email:', wallet.email)
      console.log('User ID:', wallet.user_id)

      // Set the real CavosWallet instance in auth context and wait for completion
      await setWallet(wallet)
      console.log('✅ Wallet stored successfully')

      // Create trading user in backend using real wallet data
      setAuthStep('Creating your trading profile...')
      console.log('🔄 Calling createUser with:', {
        provider: 'google',
        user_id: wallet.user_id,
        email: wallet.email,
        wallet_address: wallet.address,
        network: wallet.network
      })
      
      const response = await createUser('google', { 
        user_id: wallet.user_id, 
        email: wallet.email,
        wallet_address: wallet.address,
        network: wallet.network
      })
      
            console.log('📥 createUser response:', response)
      
      if (response.success) {
        console.log('✅ User data stored successfully')
        console.log('Using real Cavos user ID:', wallet.user_id)
        console.log('Using real wallet address:', wallet.address)
        
        // Navigate to main app after storage is complete
        setAuthStep('Redirecting to main app...')
        
        // Wait a bit for storage operations to complete fully
        setTimeout(() => {
          console.log('🚀 Navigation attempt after storage completion...')
          try {
            if (Platform.OS === 'web') {
              // Use window.location.href as primary method since router.replace isn't working
              console.log('🔄 Using window.location.href for navigation...')
              window.location.href = '/'
              console.log('✅ Navigation successful')
            } else {
              // Use router for mobile platforms
              console.log('🔄 Using router for mobile navigation...')
              router.replace('/(tabs)')
              console.log('✅ Mobile navigation successful')
            }
          } catch (error) {
            console.error('❌ Navigation failed, trying router fallback:', error)
            // Fallback to router
            try {
              router.replace('/(tabs)')
            } catch (routerError) {
              console.error('❌ Router fallback also failed:', routerError)
              // Final fallback: reload the page
              if (Platform.OS === 'web' && typeof window !== 'undefined') {
                window.location.href = '/'
              }
            }
          }
        }, 500) // Reduced timeout since we're now waiting for storage
      } else {
        console.error('❌ User data storage failed:', response.error)
        Alert.alert(
          'Setup Error', 
          'Failed to create your trading profile. Please try again.',
          [{ text: 'OK' }]
        )
      }
      
    } catch (error) {
      console.error('Login failed:', error)
      Alert.alert('Error', 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
      setAuthStep('')
      isProcessing.current = false
    }
  }

  const handleAuthError = (error: any) => {
    console.error('Authentication error:', error)
    Alert.alert('Authentication Failed', error?.message || 'Authentication failed. Please try again.')
    isProcessing.current = false
  }

  return (
    <View style={styles.container}>
      <SpaceBackground />
      <SafeAreaView style={styles.contentWrapper}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to AsTrade</Text>
            <Text style={styles.subtitle}>
              Your gateway to the cosmos of decentralized trading
            </Text>
          </View>

          <View style={styles.authContainer}>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.loadingText}>{authStep}</Text>
              </View>
            )}

            {!loading && (
              <>
                {authMode === 'social' && (
                  <>
                    {/* <GoogleSignIn 
                      onSuccess={handleAuthSuccess}
                      onError={handleAuthError}
                      style={[styles.authButton, createShadow(shadowPresets.medium)]}
                    />
                    
                    <AppleSignIn 
                      onSuccess={handleAuthSuccess}
                      onError={handleAuthError}
                      style={[styles.authButton, createShadow(shadowPresets.medium)]}
                    /> */}

                    <TouchableOpacity 
                      style={styles.modeToggle}
                      onPress={() => setAuthMode('email-login')}
                    >
                      <Text style={styles.modeToggleText}>Sign in with Email</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.modeToggle}
                      onPress={() => setAuthMode('email-register')}
                    >
                      <Text style={styles.modeToggleText}>Create Account with Email</Text>
                    </TouchableOpacity>
                  </>
                )}

                {authMode === 'email-login' && (
                  <>
                    <EmailSignIn 
                      onSuccess={handleAuthSuccess}
                      onError={handleAuthError}
                    />

                    <TouchableOpacity 
                      style={styles.modeToggle}
                      onPress={() => setAuthMode('social')}
                    >
                      <Text style={styles.modeToggleText}>Back to Social Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.modeToggle}
                      onPress={() => setAuthMode('email-register')}
                    >
                      <Text style={styles.modeToggleText}>Don't have an account? Sign up</Text>
                    </TouchableOpacity>
                  </>
                )}

                {authMode === 'email-register' && (
                  <>
                    <EmailSignUp 
                      onSuccess={handleAuthSuccess}
                      onError={handleAuthError}
                    />

                    <TouchableOpacity 
                      style={styles.modeToggle}
                      onPress={() => setAuthMode('social')}
                    >
                      <Text style={styles.modeToggleText}>Back to Social Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.modeToggle}
                      onPress={() => setAuthMode('email-login')}
                    >
                      <Text style={styles.modeToggleText}>Already have an account? Sign in</Text>
                    </TouchableOpacity>
                  </>
                )}
              </>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Secure • Decentralized • Interstellar
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0B2E',
  },
  contentWrapper: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 24,
  },
  authContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  loadingSubtext: {
    color: '#B0B0B0',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  authButton: {
    width: '100%',
    marginBottom: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  modeToggle: {
    marginTop: 12,
    paddingVertical: 8,
  },
  modeToggleText: {
    color: '#8B5CF6',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
}) 