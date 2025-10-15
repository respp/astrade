import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { createShadow, shadowPresets } from '../lib/platform-styles'
import { useAuth } from '../contexts/AuthContext'

interface EmailSignInProps {
  onSuccess: (wallet: any) => void
  onError: (error: any) => void
  style?: any
}

export default function EmailSignIn({ onSuccess, onError, style }: EmailSignInProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginWithEmail, setupX10Trading, backendUserId } = useAuth()

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleLogin = async () => {
    // Validation
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address')
      return
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address')
      return
    }

    if (!password) {
      Alert.alert('Error', 'Please enter your password')
      return
    }

    try {
      setLoading(true)
      
      // Create a mock CavosWallet-like object for consistency with existing auth flow
      const mockWallet = await loginWithEmail({
        email: email.trim(),
        password,
        network: 'sepolia' as const
      })

      console.log('✅ Email login successful:', mockWallet)
      
      // Setup X10 trading for users who might not have it yet
      if (backendUserId) {
        console.log('🚀 Checking X10 trading setup for logged in user...')
        try {
          const x10SetupResult = await setupX10Trading(backendUserId)
          if (x10SetupResult.success) {
            console.log('✅ X10 trading setup completed for logged in user')
          } else {
            console.warn('⚠️ X10 trading setup failed for logged in user:', x10SetupResult.error)
          }
        } catch (error) {
          console.warn('⚠️ X10 trading setup error for logged in user:', error)
        }
      }
      
      onSuccess(mockWallet)
    } catch (error) {
      console.error('❌ Email login failed:', error)
      onError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['#1E1B4B', '#312E81']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.button, createShadow(shadowPresets.medium)]}
      >
        <TouchableOpacity
          style={styles.touchable}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Sign In with Email</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    borderRadius: 12,
    marginBottom: 16,
  },
  touchable: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
})
