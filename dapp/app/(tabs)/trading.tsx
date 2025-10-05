import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/contexts/AuthContext';
import { StarkTrading } from '@/components/StarkTrading';
import { useLocalSearchParams } from 'expo-router';

export default function TradingScreen() {
  const { authenticated } = useAuth();
  const { market } = useLocalSearchParams<{ market: string }>();

  if (!authenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#0f0f23', '#1a1a2e', '#16213e']} style={styles.gradient}>
          <View style={styles.centerContainer}>
            <Text style={styles.notAuthenticatedText}>Please login to start trading</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0f0f23', '#1a1a2e', '#16213e']} style={styles.gradient}>
        <StatusBar style="light" />
        <StarkTrading market={market || 'BTC-USD'} />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notAuthenticatedText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
}); 