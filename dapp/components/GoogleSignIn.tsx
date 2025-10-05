import React from 'react'
import { View, StyleSheet, ViewStyle, Platform, Alert, Text } from 'react-native'
import { SignInWithGoogle, CavosWallet } from 'cavos-service-native'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'

// Configure WebBrowser for better OAuth handling
WebBrowser.maybeCompleteAuthSession()

interface GoogleSignInProps {
  onSuccess?: (wallet: CavosWallet) => void
  onError?: (error: any) => void
  style?: ViewStyle | ViewStyle[]
}

export default function GoogleSignIn({ onSuccess, onError, style }: GoogleSignInProps) {
  const handleSuccess = (wallet: CavosWallet) => {
    console.log('✅ Google login successful:', wallet)
    console.log('Wallet address:', wallet.address)
    console.log('Network:', wallet.network)
    console.log('User email:', wallet.email)
    console.log('User ID:', wallet.user_id)
    
    if (onSuccess) {
      onSuccess(wallet)
    }
  }

  const handleError = (error: any) => {
    console.error('❌ Google Sign In failed:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    
    // Show user-friendly error message
    Alert.alert(
      'Authentication Failed', 
      'There was an issue with Google Sign-In. Please try again or contact support if the problem persists.',
      [{ text: 'OK' }]
    )
    
    if (onError) {
      onError(error)
    }
  }

  // Use different redirect URIs for web vs mobile
  const getRedirectUri = () => {
    if (Platform.OS === 'web') {
      // Use current origin for better development flexibility
      if (typeof window !== 'undefined') {
        return `${window.location.origin}/callback`
      }
      // Fallback for server-side rendering
      return 'http://localhost:8081/callback'
    }
    
    // For mobile, ensure the scheme is properly registered
    const scheme = Linking.createURL('callback')
    console.log('📱 Mobile redirect URI:', scheme)
    return scheme
  }

  // Debug configuration
  const appId = process.env.EXPO_PUBLIC_CAVOS_APP_ID!
  const network = process.env.EXPO_PUBLIC_CAVOS_NETWORK || "sepolia"
  const redirectUri = getRedirectUri()

  console.log('🔧 GoogleSignIn Configuration:', {
    appId,
    network,
    redirectUri,
    platform: Platform.OS,
    hasAppId: !!appId,
    appIdLength: appId?.length
  })

  if (!appId || appId === 'your-cavos-app-id') {
    console.error('❌ CAVOS_APP_ID not configured properly')
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.button, styles.errorButton]}>
          <Text style={styles.errorText}>CAVOS_APP_ID not configured</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, style]}>
      <SignInWithGoogle
        appId={appId}
        network={network}
        finalRedirectUri={redirectUri}
        onSuccess={handleSuccess}
        onError={handleError}
        style={styles.button}
      >
        Continue with Google
      </SignInWithGoogle>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorButton: {
    backgroundColor: '#EF4444',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
}) 