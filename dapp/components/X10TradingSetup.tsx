import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Zap, Shield, Star } from 'lucide-react-native';
import { createShadow, shadowPresets } from '../lib/platform-styles';
import { useAuth } from '../contexts/AuthContext';

interface X10TradingSetupProps {
  style?: any;
}

export default function X10TradingSetup({ style }: X10TradingSetupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const { backendUserId, x10Credentials, setupX10Trading } = useAuth();

  const handleSetupX10 = async () => {
    if (!backendUserId) {
      Alert.alert('Error', 'No backend user ID found. Please log in first.');
      return;
    }

    try {
      setLoading(true);
      
      console.log('🚀 Manual X10 trading setup initiated');
      const result = await setupX10Trading(backendUserId);
      
      if (result.success) {
        Alert.alert(
          'Success!',
          'X10 trading account has been set up successfully. You can now access perpetual trading features.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Setup Failed',
          `Failed to setup X10 trading: ${result.error}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Manual X10 setup failed:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred during X10 setup.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = () => {
    if (x10Credentials) {
      Alert.alert(
        'X10 Trading Status',
        `✅ X10 trading is set up!\n\nL2 Vault: ${x10Credentials.l2_vault}\nEthereum Address: ${x10Credentials.eth_address}\nEnvironment: ${x10Credentials.environment}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'X10 Trading Status',
        '❌ X10 trading is not set up yet. Click "Setup X10 Trading" to get started.',
        [{ text: 'OK' }]
      );
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
              <Text style={styles.statusButtonText}>Check Status</Text>
            </TouchableOpacity>

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
                    <Text style={styles.buttonText}>Setup X10 Trading</Text>
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
});

