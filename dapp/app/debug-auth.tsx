import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { accountService } from '../lib/api/services/account';

export default function DebugAuthScreen() {
  const { createUser, setWallet, signOut, authenticated, userId, backendUserId, loading, cavosWallet } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    // Capture environment variables
    const envInfo = {
      CAVOS_APP_ID: process.env.EXPO_PUBLIC_CAVOS_APP_ID,
      CAVOS_NETWORK: process.env.EXPO_PUBLIC_CAVOS_NETWORK,
      BASE_URL: process.env.EXPO_PUBLIC_BASE_URL,
      MOCK_MODE: process.env.EXPO_PUBLIC_MOCK_MODE,
    };

    setDebugInfo({
      environment: envInfo,
      auth: {
        authenticated,
        userId,
        backendUserId,
        loading,
        hasWallet: !!cavosWallet
      }
    });

    addLog('🔍 Debug screen loaded');
    addLog(`Environment: ${JSON.stringify(envInfo, null, 2)}`);
  }, [authenticated, userId, backendUserId, loading, cavosWallet]);

  const testBackendConnection = async () => {
    try {
      addLog('🔍 Testing backend connection...');
      
      const response = await fetch('http://localhost:8000/health');
      const data = await response.json();
      
      addLog(`✅ Backend health: ${JSON.stringify(data)}`);
    } catch (error) {
      addLog(`❌ Backend connection failed: ${error}`);
    }
  };

  const testUserCreation = async () => {
    try {
      addLog('👤 Testing user creation...');
      
      const testData = {
        provider: 'google' as const,
        email: `debug-${Date.now()}@example.com`,
        cavos_user_id: `debug-cavos-${Date.now()}`,
        wallet_address: `0x${Date.now().toString(16)}`
      };

      addLog(`📤 Creating user with data: ${JSON.stringify(testData)}`);
      
      const result = await accountService.createUser(testData);
      addLog(`✅ User created: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(`❌ User creation failed: ${error}`);
    }
  };

  const testUserLookup = async () => {
    try {
      addLog('🔍 Testing user lookup...');
      
      if (!userId) {
        addLog('⚠️ No userId available for lookup');
        return;
      }

      const result = await accountService.getUserByCavosId(userId);
      addLog(`✅ User lookup result: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(`❌ User lookup failed: ${error}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const signOutUser = async () => {
    try {
      addLog('🚪 Signing out...');
      await signOut();
      addLog('✅ Sign out completed');
    } catch (error) {
      addLog(`❌ Sign out failed: ${error}`);
    }
  };

  return (
    <LinearGradient colors={['#0f0f23', '#1a1a2e', '#16213e']} style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>🔧 Auth Debug Panel</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environment Variables</Text>
          <Text style={styles.codeText}>
            {JSON.stringify(debugInfo.environment, null, 2)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Auth State</Text>
          <Text style={styles.codeText}>
            {JSON.stringify(debugInfo.auth, null, 2)}
          </Text>
        </View>

        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.button} onPress={testBackendConnection}>
            <Text style={styles.buttonText}>Test Backend</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={testUserCreation}>
            <Text style={styles.buttonText}>Test User Creation</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={testUserLookup}>
            <Text style={styles.buttonText}>Test User Lookup</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={signOutUser}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearLogs}>
            <Text style={styles.buttonText}>Clear Logs</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debug Logs</Text>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>{log}</Text>
          ))}
          {logs.length === 0 && (
            <Text style={styles.noLogsText}>No logs yet</Text>
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
  section: {
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
  codeText: {
    fontSize: 12,
    color: '#B0B0B0',
    fontFamily: 'monospace',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 8,
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
  logText: {
    fontSize: 12,
    color: '#B0B0B0',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  noLogsText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 