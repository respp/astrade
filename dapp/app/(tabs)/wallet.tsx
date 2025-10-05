import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '@/contexts/AuthContext'

export default function WalletScreen() {
  const { authenticated, userId, cavosWallet, signOut } = useAuth()
  const [loading, setLoading] = useState(false)
  const [walletInfo, setWalletInfo] = useState<any>(null)
  const [showFullPrivateKey, setShowFullPrivateKey] = useState(false)

  useEffect(() => {
    console.log('🔍 Wallet Screen Debug:', {
      authenticated,
      userId,
      cavosWallet: !!cavosWallet,
      walletInfo,
      cavosWalletDetails: cavosWallet ? {
        address: cavosWallet.address,
        network: cavosWallet.network,
        email: cavosWallet.email,
        user_id: cavosWallet.user_id
      } : null
    })
    
    if (cavosWallet && authenticated) {
      // Get real wallet information from Cavos wallet
      console.log('✅ Real CavosWallet instance found:', cavosWallet)
      console.log('Wallet address:', cavosWallet.address)
      console.log('Wallet network:', cavosWallet.network)
      console.log('Wallet email:', cavosWallet.email)
      console.log('Wallet user_id:', cavosWallet.user_id)
      
      // Create wallet info object from the real CavosWallet instance
      const info = {
        address: cavosWallet.address,
        network: cavosWallet.network,
        email: cavosWallet.email,
        userId: cavosWallet.user_id,
        orgId: (cavosWallet as any).org_id || 'Not available',
        privateKey: (cavosWallet as any).private_key || (cavosWallet as any).privateKey || 'Not available'
      }
      
      setWalletInfo(info)
      console.log('✅ Real wallet info loaded:', info)
    } else {
      console.log('⚠️ Wallet not available:', { 
        cavosWallet: !!cavosWallet, 
        authenticated,
        cavosWalletType: cavosWallet ? typeof cavosWallet : 'null'
      })
    }
  }, [cavosWallet, authenticated])

  const handleLogout = async () => {
    try {
      await signOut() // Use AuthContext signOut for consistency
      Alert.alert('Success', 'Logged out successfully')
    } catch (error) {
      Alert.alert('Error', 'Failed to logout')
    }
  }

  const handleExecuteTransaction = async () => {
    if (!cavosWallet) return

    try {
      setLoading(true)
      // Use the real Cavos wallet execute method
      const result = await cavosWallet.execute(
        '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d', // Contract address
        'transfer', // Method
        ['0x1234567890abcdef1234567890abcdef12345678', '1000000000000000000', '0'] // Parameters
      )
      
      Alert.alert('Transaction Successful', `Result: ${JSON.stringify(result)}`)
    } catch (error) {
      console.error('Transaction failed:', error)
      Alert.alert('Error', 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  const handleBatchExecute = async () => {
    if (!cavosWallet) return

    try {
      setLoading(true)
      // Use the real Cavos wallet execute method for batch operations
      Alert.alert('Info', 'Batch execution will be implemented with real Cavos SDK methods')
    } catch (error) {
      Alert.alert('Error', 'Batch execution failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSwapTokens = async () => {
    if (!cavosWallet) return

    try {
      setLoading(true)
      // Use the real Cavos wallet execute method for token swaps
      Alert.alert('Info', 'Token swap will be implemented with real Cavos SDK methods')
    } catch (error) {
      Alert.alert('Error', 'Token swap failed')
    } finally {
      setLoading(false)
    }
  }

  if (!authenticated || !cavosWallet) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
          <View style={styles.centeredContainer}>
            <Text style={styles.notAuthenticatedText}>Please connect your wallet first</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Real Cavos Wallet</Text>
            <Text style={styles.subtitle}>Authenticated User Data</Text>
          </View>

          {walletInfo && (
            <View style={styles.walletInfoCard}>
              <Text style={styles.cardTitle}>Real Cavos Wallet Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue}>
                  {walletInfo.address ? `${walletInfo.address.substring(0, 10)}...${walletInfo.address.substring(38)}` : 'Not available'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Network:</Text>
                <Text style={styles.infoValue}>{walletInfo.network || 'Not available'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{walletInfo.email || 'Not available'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>User ID:</Text>
                <Text style={styles.infoValue}>{walletInfo.userId || walletInfo.user_id || 'Not available'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Org ID:</Text>
                <Text style={styles.infoValue}>{walletInfo.orgId || walletInfo.org_id || 'Not available'}</Text>
              </View>
              {/* Debug: Private Key - Only for development */}
              {__DEV__ && walletInfo.privateKey && walletInfo.privateKey !== 'Not available' && (
                <View style={{ backgroundColor: 'rgba(255, 165, 0, 0.1)', padding: 8, borderRadius: 4, marginVertical: 4 }}>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: '#FFA500' }]}>🔐 Private Key (DEBUG):</Text>
                    <TouchableOpacity
                      onPress={() => setShowFullPrivateKey(!showFullPrivateKey)}
                      style={{ backgroundColor: 'rgba(255, 165, 0, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}
                    >
                      <Text style={[styles.infoValue, { fontSize: 12, color: '#FFA500' }]}>
                        {showFullPrivateKey ? 'Hide' : 'Show'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.infoValue, { fontSize: 10, fontFamily: 'monospace', color: '#FFA500', marginTop: 4 }]}>
                    {showFullPrivateKey ? 
                      walletInfo.privateKey : 
                      `${walletInfo.privateKey.substring(0, 10)}...${walletInfo.privateKey.substring(walletInfo.privateKey.length - 10)}`
                    }
                  </Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Auth Status:</Text>
                <Text style={[styles.infoValue, { color: authenticated ? '#10B981' : '#EF4444' }]}>
                  {authenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
                </Text>
              </View>
            </View>
          )}

          {/* Current Auth Context Info */}
          <View style={styles.walletInfoCard}>
            <Text style={styles.cardTitle}>Current Auth Context</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Authenticated:</Text>
              <Text style={[styles.infoValue, { color: authenticated ? '#10B981' : '#EF4444' }]}>
                {authenticated ? '✅ Yes' : '❌ No'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>User ID:</Text>
              <Text style={styles.infoValue}>{userId || 'Not set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Wallet Connected:</Text>
              <Text style={[styles.infoValue, { color: cavosWallet ? '#10B981' : '#EF4444' }]}>
                {cavosWallet ? '✅ Yes' : '❌ No'}
              </Text>
            </View>
          </View>

          {/* Debug: Raw Wallet Data */}
          {__DEV__ && walletInfo && (
            <View style={[styles.walletInfoCard, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
              <Text style={styles.cardTitle}>🔧 Debug: Raw Wallet Data</Text>
              <Text style={[styles.infoValue, { fontSize: 12, fontFamily: 'monospace' }]}>
                {JSON.stringify(walletInfo, null, 2)}
              </Text>
            </View>
          )}

          {/* Debug: Current State */}
          {__DEV__ && (
            <View style={[styles.walletInfoCard, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
              <Text style={styles.cardTitle}>🔧 Debug: Current State</Text>
              <Text style={[styles.infoValue, { fontSize: 12, fontFamily: 'monospace' }]}>
                {JSON.stringify({
                  authenticated,
                  userId,
                  hasCavosWallet: !!cavosWallet,
                  hasWalletInfo: !!walletInfo,
                  cavosWalletAddress: cavosWallet?.address,
                  cavosWalletNetwork: cavosWallet?.network
                }, null, 2)}
              </Text>
            </View>
          )}

          <View style={styles.actionsContainer}>
            <Text style={styles.cardTitle}>Wallet Operations</Text>
            
            <TouchableOpacity
              style={[styles.actionButton, loading && styles.buttonDisabled]}
              onPress={() => {
                console.log('🧪 Testing wallet connection...')
                if (cavosWallet) {
                  Alert.alert('Wallet Test', `Wallet is connected!\nAddress: ${cavosWallet.address}\nNetwork: ${cavosWallet.network}`)
                } else {
                  Alert.alert('Wallet Test', 'No wallet connected')
                }
              }}
              disabled={loading}
            >
              <Text style={styles.buttonText}>🧪 Test Wallet Connection</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, loading && styles.buttonDisabled]}
              onPress={() => {
                console.log('🔄 Refreshing wallet data...')
                // Force re-evaluation of wallet data
                if (cavosWallet) {
                  const info = {
                    address: cavosWallet.address,
                    network: cavosWallet.network,
                    email: cavosWallet.email,
                    userId: cavosWallet.user_id,
                    orgId: (cavosWallet as any).org_id || 'Not available',
                    privateKey: (cavosWallet as any).private_key || (cavosWallet as any).privateKey || 'Not available'
                  }
                  setWalletInfo(info)
                  console.log('✅ Wallet data refreshed:', info)
                  Alert.alert('Refresh', 'Wallet data refreshed!')
                } else {
                  Alert.alert('Refresh', 'No wallet to refresh')
                }
              }}
              disabled={loading}
            >
              <Text style={styles.buttonText}>🔄 Refresh Wallet Data</Text>
            </TouchableOpacity>

            {/* Debug: Private Key Access Button - Only for development */}
            {__DEV__ && walletInfo?.privateKey && walletInfo.privateKey !== 'Not available' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#FFA500' }, loading && styles.buttonDisabled]}
                onPress={() => {
                  Alert.alert(
                    '🔐 Private Key (DEBUG ONLY)',
                    walletInfo.privateKey,
                    [
                      { text: 'Close', style: 'cancel' },
                      { 
                        text: 'Log to Console', 
                        onPress: () => {
                          console.log('🔐 Private Key (DEBUG):', walletInfo.privateKey)
                          Alert.alert('Logged', 'Private key logged to console')
                        }
                      }
                    ]
                  )
                }}
                disabled={loading}
              >
                <Text style={styles.buttonText}>🔐 Show Full Private Key (DEBUG)</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, loading && styles.buttonDisabled]}
              onPress={handleExecuteTransaction}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Execute Transaction</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, loading && styles.buttonDisabled]}
              onPress={handleBatchExecute}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Execute Batch Calls</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, loading && styles.buttonDisabled]}
              onPress={handleSwapTokens}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Swap Tokens</Text>
            </TouchableOpacity>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Processing...</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  notAuthenticatedText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e0e0',
    textAlign: 'center',
  },
  walletInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#e0e0e0',
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  actionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}) 