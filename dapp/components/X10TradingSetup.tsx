import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, Zap, Shield, Star } from 'lucide-react-native';

export default function X10TradingSetup() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.container}>
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
            <TouchableOpacity style={styles.primaryButton}>
              <LinearGradient
                colors={['#bf7af0', '#8b5cf6']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Start Trading</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Learn More</Text>
            </TouchableOpacity>
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
  primaryButton: {
    flex: 1,
  },
  buttonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(191, 122, 240, 0.3)',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#bf7af0',
    fontSize: 16,
    fontWeight: '600',
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
