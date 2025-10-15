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

interface EmailSignUpProps {
  onSuccess: (wallet: any) => void
  onError: (error: any) => void
  style?: any
}

export default function EmailSignUp({ onSuccess, onError, style }: EmailSignUpProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { registerWithEmail, setupX10Trading, backendUserId } = useAuth()

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
  }

  const handleRegister = async () => {
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
      Alert.alert('Error', 'Please enter a password')
      return
    }

    if (!validatePassword(password)) {
      Alert.alert(
        'Password Requirements',
        'Password must be at least 8 characters long and contain:\n• One uppercase letter\n• One lowercase letter\n• One number\n• One special character (@$!%*?&)'
      )
      return
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return
    }

    try {
      setLoading(true)
      
      // Create a mock CavosWallet-like object for consistency with existing auth flow
      const mockWallet = await registerWithEmail({
        email: email.trim(),
        password,
        network: 'sepolia' as const
      })

      console.log('✅ Email registration successful:', mockWallet)
      
      // Setup X10 trading for new users after registration
      if (backendUserId) {
        console.log('🚀 Setting up X10 trading for new registered user...')
        try {
          const x10SetupResult = await setupX10Trading(backendUserId)
          if (x10SetupResult.success) {
            console.log('✅ X10 trading setup completed for new registered user')
          } else {
            console.warn('⚠️ X10 trading setup failed for registered user:', x10SetupResult.error)
          }
        } catch (error) {
          console.warn('⚠️ X10 trading setup error for registered user:', error)
        }
      }
      
      onSuccess(mockWallet)
    } catch (error) {
      console.error('❌ Email registration failed:', error)
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
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Create Account with Email</Text>
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

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#9CA3AF"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <Text style={styles.passwordHint}>
          Password must be at least 8 characters with uppercase, lowercase, number, and special character
        </Text>
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
  passwordHint: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 8,
  },
})
