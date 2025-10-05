import React from 'react'
import { View, StyleSheet, ViewStyle, Platform } from 'react-native'
import { SignInWithApple, CavosWallet } from 'cavos-service-native'

interface AppleSignInProps {
  onSuccess?: (wallet: CavosWallet) => void
  onError?: (error: any) => void
  style?: ViewStyle | ViewStyle[]
}

export default function AppleSignIn({ onSuccess, onError, style }: AppleSignInProps) {
  const handleSuccess = (wallet: CavosWallet) => {
    console.log('✅ Apple login successful:', wallet)
    console.log('Wallet address:', wallet.address)
    console.log('Network:', wallet.network)
    console.log('User email:', wallet.email)
    console.log('User ID:', wallet.user_id)
    
    if (onSuccess) {
      onSuccess(wallet)
    }
  }

  const handleError = (error: any) => {
    console.error('❌ Apple Sign In failed:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    
    if (onError) {
      onError(error)
    }
  }

  // Use different redirect URIs for web vs mobile
  const getRedirectUri = () => {
    if (Platform.OS === 'web') {
      return 'http://localhost:8081/callback'
    }
    return 'astrade://callback'
  }

  return (
    <View style={[styles.container, style]}>
      <SignInWithApple
        appId={process.env.EXPO_PUBLIC_CAVOS_APP_ID!}
        network={process.env.EXPO_PUBLIC_CAVOS_NETWORK || "sepolia"}
        finalRedirectUri={getRedirectUri()}
        onSuccess={handleSuccess}
        onError={handleError}
        style={styles.button}
      >
        Continue with Apple
      </SignInWithApple>
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
}) 