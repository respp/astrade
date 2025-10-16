import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Zap, Shield, Star, RefreshCw, Key, Plus } from 'lucide-react-native';
import { createShadow, shadowPresets } from '../lib/platform-styles';
import { useAuth } from '../contexts/AuthContext';
import { x10Service } from '../lib/api/services/x10';

interface X10TradingSetupProps {
  style?: any;
}

export default function X10TradingSetup({ style }: X10TradingSetupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [onboardingMethod, setOnboardingMethod] = useState<'generate' | 'private_key'>('generate');
  const { backendUserId, x10Credentials, setupX10Trading } = useAuth();

  const handleSetupX10 = async () => {
    if (!backendUserId) {
      Alert.alert('Error', 'No backend user ID found. Please log in first.');
      return;
    }

    // Show onboarding options modal
    setShowOnboardingModal(true);
  };

  const handleOnboardWithPrivateKey = async () => {
    if (!privateKey.trim()) {
      Alert.alert('Error', 'Please enter a valid Ethereum private key.');
      return;
    }

    if (!backendUserId) {
      Alert.alert('Error', 'No backend user ID found. Please log in first.');
      return;
    }

    try {
      setLoading(true);
      setShowOnboardingModal(false);
      
      console.log('🚀 X10 onboarding with private key initiated');
      const response = await x10Service.onboardUser(backendUserId, privateKey.trim());
      
      if (response.success && response.account_data) {
        Alert.alert(
          'Success!',
          `X10 trading account has been set up successfully!\n\nAccount Details:\nL2 Vault: ${response.account_data.l2_vault}\nEthereum Address: ${response.account_data.eth_address}\nEnvironment: ${response.account_data.environment}\n\nYou can now access perpetual trading features.`,
          [{ text: 'OK' }]
        );
        setPrivateKey(''); // Clear the private key
      } else {
        Alert.alert(
          'Setup Failed',
          `Failed to setup X10 trading: ${response.message}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('❌ X10 onboarding with private key failed:', error);
      Alert.alert(
        'Error',
        `An unexpected error occurred: ${error.message || error}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNewAccount = async () => {
    if (!backendUserId) {
      Alert.alert('Error', 'No backend user ID found. Please log in first.');
      return;
    }

    try {
      setLoading(true);
      setShowOnboardingModal(false);
      
      console.log('🚀 X10 account generation initiated');
      const response = await x10Service.generateNewAccount(backendUserId);
      
      if (response.success && response.generated_account) {
        Alert.alert(
          'Success!',
          `New X10 trading account generated successfully!\n\nAccount Details:\nL2 Vault: ${response.generated_account.l2_vault}\nEthereum Address: ${response.generated_account.eth_address}\nEnvironment: ${response.generated_account.environment}\nGenerated from Zero: Yes\n\nYou can now access perpetual trading features.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Setup Failed',
          `Failed to generate X10 account: ${response.message}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('❌ X10 account generation failed:', error);
      Alert.alert(
        'Error',
        `An unexpected error occurred: ${error.message || error}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!backendUserId) {
      Alert.alert('Error', 'No backend user ID found. Please log in first.');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Checking X10 status...');
      
      const response = await x10Service.checkX10Status(backendUserId);
      
      if (response.success && response.has_x10_account && response.x10_credentials) {
        Alert.alert(
          'X10 Trading Status',
          `✅ X10 trading is set up!\n\nL2 Vault: ${response.x10_credentials.l2_vault}\nEthereum Address: ${response.x10_credentials.eth_address}\nEnvironment: ${response.x10_credentials.environment}\nGenerated from Zero: ${response.x10_credentials.generated_from_zero ? 'Yes' : 'No'}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'X10 Trading Status',
          `❌ X10 trading is not set up yet.\n\nStatus: ${response.message}\n\nClick "Setup X10 Trading" to get started.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('❌ Status check failed:', error);
      Alert.alert(
        'Error',
        `Failed to check X10 status: ${error.message || error}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshCredentials = async () => {
    if (!backendUserId) {
      Alert.alert('Error', 'No backend user ID found. Please log in first.');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Refreshing X10 credentials...');
      
      const response = await x10Service.getX10Credentials(backendUserId);
      
      if (response.success && response.has_x10_account && response.x10_credentials) {
        Alert.alert(
          'Credentials Refreshed',
          `✅ X10 credentials refreshed successfully!\n\nL2 Vault: ${response.x10_credentials.l2_vault}\nEthereum Address: ${response.x10_credentials.eth_address}\nEnvironment: ${response.x10_credentials.environment}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Refresh Failed',
          `Failed to refresh credentials: ${response.message}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('❌ Credentials refresh failed:', error);
      Alert.alert(
        'Error',
        `Failed to refresh credentials: ${error.message || error}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            <Zap size={24} color="#bf7af0" />
            <Text style={styles.title}>X10 Perpetual Trading</Text>
          </View>
          <Text style={styles.expandIcon}>{isExpanded ? '−' : '+'}</Text>
        </View>
        <Text style={styles.subtitle}>Advanced leverage trading with up to 10x leverage</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={[
              styles.statusValue,
              { color: x10Credentials ? '#10B981' : '#EF4444' }
            ]}>
              {x10Credentials ? '✅ Ready' : '❌ Not Set Up'}
            </Text>
          </View>

          {x10Credentials && (
            <View style={styles.credentialsContainer}>
              <Text style={styles.credentialsTitle}>Account Details:</Text>
              <Text style={styles.credentialItem}>
                L2 Vault: {x10Credentials.l2_vault}
              </Text>
              <Text style={styles.credentialItem}>
                ETH Address: {x10Credentials.eth_address}
              </Text>
              <Text style={styles.credentialItem}>
                Environment: {x10Credentials.environment}
              </Text>
              <Text style={styles.credentialItem}>
                Generated from Zero: {x10Credentials.generated_from_zero ? 'Yes' : 'No'}
              </Text>
            </View>
          )}

          <View style={styles.features}>
            <View style={styles.featureItem}>
              <TrendingUp size={20} color="#10B981" />
              <Text style={styles.featureText}>Up to 10x Leverage</Text>
            </View>
            <View style={styles.featureItem}>
              <Shield size={20} color="#10B981" />
              <Text style={styles.featureText}>Risk Management</Text>
            </View>
            <View style={styles.featureItem}>
              <Star size={20} color="#10B981" />
              <Text style={styles.featureText}>Advanced Analytics</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.statusButton}
              onPress={handleCheckStatus}
              disabled={loading}
            >
              <RefreshCw size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.statusButtonText}>Check Status</Text>
            </TouchableOpacity>

            {x10Credentials && (
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={handleRefreshCredentials}
                disabled={loading}
              >
                <RefreshCw size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.statusButtonText}>Refresh</Text>
              </TouchableOpacity>
            )}

            {!x10Credentials && (
              <LinearGradient
                colors={['#bf7af0', '#8b5cf6']}
                style={[styles.primaryButton, createShadow(shadowPresets.medium)]}
              >
                <TouchableOpacity
                  style={styles.buttonGradient}
                  onPress={handleSetupX10}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Plus size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.buttonText}>Setup X10 Trading</Text>
                    </>
                  )}
                </TouchableOpacity>
              </LinearGradient>
            )}
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>What is X10 Trading?</Text>
            <Text style={styles.infoText}>
              X10 is a decentralized perpetual trading protocol that allows you to trade
              crypto assets with leverage. Our integration automatically generates a
              secure trading account for you with testnet funds.
            </Text>
            <Text style={styles.infoText}>
              • Automatic account generation from zero
            </Text>
            <Text style={styles.infoText}>
              • Secure credential storage
            </Text>
            <Text style={styles.infoText}>
              • Testnet trading environment
            </Text>
            <Text style={styles.infoText}>
              • Ready for perpetual trading
            </Text>
          </View>

          <View style={styles.warning}>
            <Text style={styles.warningText}>
              ⚠️ High leverage trading involves significant risk. Only trade with funds you can afford to lose.
            </Text>
          </View>
        </View>
      )}

      {/* Onboarding Options Modal */}
      <Modal
        visible={showOnboardingModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowOnboardingModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Setup X10 Trading Account</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowOnboardingModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Choose how you'd like to set up your X10 trading account:
            </Text>

            {/* Option 1: Generate New Account */}
            <TouchableOpacity
              style={[
                styles.onboardingOption,
                onboardingMethod === 'generate' && styles.selectedOption
              ]}
              onPress={() => setOnboardingMethod('generate')}
            >
              <View style={styles.optionHeader}>
                <Plus size={24} color="#10B981" />
                <Text style={styles.optionTitle}>Generate New Account</Text>
              </View>
              <Text style={styles.optionDescription}>
                Create a completely new X10 trading account from zero. No existing wallet required.
              </Text>
              <View style={styles.optionFeatures}>
                <Text style={styles.optionFeature}>✓ No private key needed</Text>
                <Text style={styles.optionFeature}>✓ Automatic account generation</Text>
                <Text style={styles.optionFeature}>✓ Testnet environment</Text>
              </View>
            </TouchableOpacity>

            {/* Option 2: Use Private Key */}
            <TouchableOpacity
              style={[
                styles.onboardingOption,
                onboardingMethod === 'private_key' && styles.selectedOption
              ]}
              onPress={() => setOnboardingMethod('private_key')}
            >
              <View style={styles.optionHeader}>
                <Key size={24} color="#F59E0B" />
                <Text style={styles.optionTitle}>Use Existing Wallet</Text>
              </View>
              <Text style={styles.optionDescription}>
                Onboard using your existing Ethereum private key to connect your wallet to X10.
              </Text>
              <View style={styles.optionFeatures}>
                <Text style={styles.optionFeature}>✓ Connect existing wallet</Text>
                <Text style={styles.optionFeature}>✓ Use your ETH address</Text>
                <Text style={styles.optionFeature}>✓ Full control</Text>
              </View>
            </TouchableOpacity>

            {/* Private Key Input */}
            {onboardingMethod === 'private_key' && (
              <View style={styles.privateKeyContainer}>
                <Text style={styles.inputLabel}>Ethereum Private Key</Text>
                <TextInput
                  style={styles.privateKeyInput}
                  value={privateKey}
                  onChangeText={setPrivateKey}
                  placeholder="Enter your 64-character private key (0x...)"
                  placeholderTextColor="#6B7280"
                  secureTextEntry={true}
                  multiline={true}
                  numberOfLines={3}
                />
                <Text style={styles.inputWarning}>
                  ⚠️ Your private key is secure and only used for X10 onboarding
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowOnboardingModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <LinearGradient
                colors={['#bf7af0', '#8b5cf6']}
                style={[styles.confirmButton, createShadow(shadowPresets.medium)]}
              >
                <TouchableOpacity
                  style={styles.confirmButtonGradient}
                  onPress={onboardingMethod === 'generate' ? handleGenerateNewAccount : handleOnboardWithPrivateKey}
                  disabled={loading || (onboardingMethod === 'private_key' && !privateKey.trim())}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>
                      {onboardingMethod === 'generate' ? 'Generate Account' : 'Connect Wallet'}
                    </Text>
                  )}
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(191, 122, 240, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.3)',
    overflow: 'hidden',
  },
  header: {
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#bf7af0',
  },
  expandIcon: {
    fontSize: 20,
    color: '#bf7af0',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  credentialsContainer: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  credentialsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  credentialItem: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  features: {
    marginBottom: 20,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statusButton: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  refreshButton: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statusButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 2,
    borderRadius: 12,
  },
  buttonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 8,
  },
  warning: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  warningText: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
    lineHeight: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 24,
    textAlign: 'center',
  },
  onboardingOption: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#bf7af0',
    backgroundColor: '#1F2937',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  optionDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
    lineHeight: 20,
  },
  optionFeatures: {
    gap: 4,
  },
  optionFeature: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '500',
  },
  privateKeyContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  privateKeyInput: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#374151',
    textAlignVertical: 'top',
    fontFamily: 'monospace',
  },
  inputWarning: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 8,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    borderRadius: 12,
  },
  confirmButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

