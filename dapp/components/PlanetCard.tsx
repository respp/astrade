import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createShadow, shadowPresets } from '@/lib/platform-styles';

interface PlanetCardProps {
  name: string;
  symbol: string;
  price: string;
  change: string;
  isPositive: boolean;
  color: string;
  description: string;
}

export default function PlanetCard({ name, symbol, price, change, isPositive, color, description }: PlanetCardProps) {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.planetIcon}>
        <View style={[styles.planet, { backgroundColor: color }]}>
          <View style={styles.planetGlow} />
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.symbol}>{symbol}</Text>
        </View>
        <Text style={styles.description}>{description}</Text>
      </View>
      
      <View style={styles.priceSection}>
        <Text style={styles.price}>{price}</Text>
        <View style={styles.changeContainer}>
          {isPositive ? (
            <TrendingUp size={16} color="#10B981" />
          ) : (
            <TrendingDown size={16} color="#EF4444" />
          )}
          <Text style={[styles.change, { color: isPositive ? '#10B981' : '#EF4444' }]}>
            {change}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  planetIcon: {
    marginRight: 15,
  },
  planet: {
    width: 48,
    height: 48,
    borderRadius: 24,
    position: 'relative',
    ...createShadow(shadowPresets.small),
  },
  planetGlow: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    top: -2,
    left: -2,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  symbol: {
    fontSize: 12,
    color: '#9CA3AF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  description: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  change: {
    fontSize: 14,
    fontWeight: '600',
  },
});