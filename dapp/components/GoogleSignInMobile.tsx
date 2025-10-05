import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { CavosWallet } from 'cavos-service-native';

interface GoogleSignInMobileProps {
  onSuccess?: (wallet: CavosWallet) => void;
  onError?: (error: any) => void;
  style?: any;
}

export default function GoogleSignInMobile({ onSuccess, onError, style }: GoogleSignInMobileProps) {
  const handlePress = async () => {
    try {
      console.log('📱 Mobile Google Sign-In pressed');
      
      // For now, create a mock wallet for testing
      // TODO: Integrate with real Google OAuth when expo-auth-session is stable
      const mockWallet: CavosWallet = {
        address: `0x${Math.random().toString(16).substring(2, 42)}`,
        network: 'sepolia',
        email: 'mobile-test@example.com',
        user_id: `mobile-${Date.now()}`,
        org_id: 'mobile-org',
        execute: async () => ({ success: true, hash: 'mock-hash' }),
      } as any;

      console.log('✅ Created mock wallet for mobile testing:', mockWallet);
      
      if (onSuccess) {
        onSuccess(mockWallet);
      }
    } catch (error) {
      console.error('❌ Mobile Google Sign-In failed:', error);
      Alert.alert(
        'Mobile Sign-In',
        'Google Sign-In for mobile is being configured. Please use web version for now.',
        [{ text: 'OK' }]
      );
      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={handlePress}>
      <Text style={styles.buttonText}>Continue with Google (Mobile)</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 