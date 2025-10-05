import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'

export default function TestDeepLinkScreen() {
  const [lastUrl, setLastUrl] = useState<string | null>(null)
  const [initialUrl, setInitialUrl] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Get initial URL
    Linking.getInitialURL().then((url) => {
      setInitialUrl(url)
      console.log('Initial URL:', url)
    })

    // Listen for URL changes
    const subscription = Linking.addEventListener('url', (event) => {
      setLastUrl(event.url)
      console.log('URL changed:', event.url)
    })

    return () => subscription?.remove()
  }, [])

  const testDeepLink = () => {
    const testUrl = 'astrade://callback?user_data=%7B%22wallet%22%3A%7B%22address%22%3A%220x123%22%2C%22network%22%3A%22sepolia%22%7D%2C%22email%22%3A%22test%40example.com%22%2C%22user_id%22%3A%22test-user-123%22%7D'
    
    Alert.alert(
      'Test Deep Link',
      `Testing: ${testUrl.substring(0, 50)}...`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Test', 
          onPress: () => {
            Linking.openURL(testUrl).catch(err => {
              console.error('Failed to open URL:', err)
              Alert.alert('Error', 'Failed to open test URL')
            })
          }
        }
      ]
    )
  }

  const testSimpleCallback = () => {
    router.push({
      pathname: '/callback' as any,
      params: {
        user_data: JSON.stringify({
          wallet: { address: '0x123test', network: 'sepolia' },
          email: 'test@example.com',
          user_id: 'test-user-123',
          org_id: 'test-org'
        })
      }
    })
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Deep Link Test</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current State</Text>
          <Text style={styles.info}>Initial URL: {initialUrl || 'None'}</Text>
          <Text style={styles.info}>Last URL: {lastUrl || 'None'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tests</Text>
          
          <TouchableOpacity style={styles.button} onPress={testDeepLink}>
            <Text style={styles.buttonText}>Test Deep Link</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={testSimpleCallback}>
            <Text style={styles.buttonText}>Test Direct Callback</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.backButton]} 
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instructions}>
            1. "Test Deep Link" - Opens the deep link URL in external browser{'\n'}
            2. "Test Direct Callback" - Simulates successful callback navigation{'\n'}
            3. Check console logs for debugging info{'\n'}
            4. If deep links work, you should see URL changes above
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 15,
  },
  info: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#8B5CF6',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: '#64748B',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
}) 