import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { accountService } from '../lib/api/services/account';

export default function TestAuthScreen() {
  const { createUser, setWallet, signOut, authenticated, userId, backendUserId, loading } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBackendConnection = async () => {
    try {
      addResult('🔍 Testing backend connection...');
      
      // Test health endpoint
      const healthResponse = await fetch('http://localhost:8000/health');
      if (healthResponse.ok) {
        addResult('✅ Backend health check passed');
      } else {
        addResult('❌ Backend health check failed');
        return;
      }

      // Test user registration
      const testUserData = {
        provider: 'google' as const,
        email: `test-${Date.now()}@example.com`,
        cavos_user_id: `test-cavos-${Date.now()}`,
        wallet_address: `0x${Date.now().toString(16)}`
      };

      addResult('📤 Testing user registration...');
      const createResponse = await accountService.createUser(testUserData);
      addResult(`✅ User created: ${createResponse.user_id}`);

      // Test user lookup by cavos ID
      addResult('🔍 Testing user lookup by Cavos ID...');
      const lookupResponse = await accountService.getUserByCavosId(testUserData.cavos_user_id);
      if (lookupResponse) {
        addResult(`✅ User found: ${lookupResponse.user_id}`);
      } else {
        addResult('❌ User lookup failed');
      }

    } catch (error) {
      addResult(`❌ Backend test failed: ${error}`);
    }
  };

  const testAuthFlow = async () => {
    try {
      addResult('🚀 Testing authentication flow...');
      
      // Simulate Cavos wallet data
      const mockWallet = {
        address: `0x${Date.now().toString(16)}`,
        network: 'sepolia',
        email: `test-${Date.now()}@example.com`,
        user_id: `test-user-${Date.now()}`,
        org_id: 'test-org',
        execute: async () => ({ success: true, hash: 'mock-hash' })
      } as any;

      addResult('📱 Setting wallet in context...');
      setWallet(mockWallet);

      addResult('👤 Creating user in backend...');
      const response = await createUser('google', {
        user_id: mockWallet.user_id,
        email: mockWallet.email,
        wallet_address: mockWallet.address,
        network: mockWallet.network
      });

      if (response.success) {
        addResult('✅ Authentication flow completed successfully');
        addResult(`📊 Auth state: authenticated=${authenticated}, userId=${userId}, backendUserId=${backendUserId}`);
      } else {
        addResult(`❌ Authentication failed: ${response.error}`);
      }

    } catch (error) {
      addResult(`❌ Auth flow test failed: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const signOutUser = async () => {
    try {
      addResult('🚪 Signing out...');
      await signOut();
      addResult('✅ Sign out completed');
    } catch (error) {
      addResult(`❌ Sign out failed: ${error}`);
    }
  };

  return (
    <LinearGradient colors={['#0f0f23', '#1a1a2e', '#16213e']} style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>🔧 Auth Test Panel</Text>
        
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          <Text style={styles.statusText}>Loading: {loading ? 'Yes' : 'No'}</Text>
          <Text style={styles.statusText}>Authenticated: {authenticated ? 'Yes' : 'No'}</Text>
          <Text style={styles.statusText}>Cavos User ID: {userId || 'None'}</Text>
          <Text style={styles.statusText}>Backend User ID: {backendUserId || 'None'}</Text>
        </View>

        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.button} onPress={testBackendConnection}>
            <Text style={styles.buttonText}>Test Backend Connection</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={testAuthFlow}>
            <Text style={styles.buttonText}>Test Auth Flow</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={signOutUser}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearResults}>
            <Text style={styles.buttonText}>Clear Results</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          {testResults.map((result, index) => (
            <Text key={index} style={styles.resultText}>{result}</Text>
          ))}
          {testResults.length === 0 && (
            <Text style={styles.noResultsText}>No test results yet</Text>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 5,
  },
  buttonSection: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#8B5CF6',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 12,
    minHeight: 200,
  },
  resultText: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  noResultsText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 