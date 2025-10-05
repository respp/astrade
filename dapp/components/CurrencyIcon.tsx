import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CurrencyIconProps {
  size?: number;
  type?: 'primary' | 'secondary' | 'premium';
}

export default function CurrencyIcon({ 
  size = 24, 
  type = 'primary' 
}: CurrencyIconProps) {
  const getColors = () => {
    switch (type) {
      case 'primary':
        return {
          outer: ['#8B5CF6', '#7C3AED'] as const,
          inner: ['#A78BFA', '#8B5CF6'] as const,
          diamond: ['#C4B5FD', '#A78BFA'] as const
        };
      case 'secondary':
        return {
          outer: ['#F59E0B', '#D97706'] as const,
          inner: ['#FBBF24', '#F59E0B'] as const,
          diamond: ['#FCD34D', '#FBBF24'] as const
        };
      case 'premium':
        return {
          outer: ['#06B6D4', '#0891B2'] as const,
          inner: ['#22D3EE', '#06B6D4'] as const,
          diamond: ['#67E8F9', '#22D3EE'] as const
        };
      default:
        return {
          outer: ['#8B5CF6', '#7C3AED'] as const,
          inner: ['#A78BFA', '#8B5CF6'] as const,
          diamond: ['#C4B5FD', '#A78BFA'] as const
        };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer ring */}
      <LinearGradient
        colors={colors.outer}
        style={[styles.outerRing, { width: size, height: size, borderRadius: size / 2 }]}
      >
        {/* Inner circle */}
        <LinearGradient
          colors={colors.inner}
          style={[styles.innerCircle, { 
            width: size * 0.8, 
            height: size * 0.8, 
            borderRadius: (size * 0.8) / 2 
          }]}
        >
          {/* Diamond shape */}
          <View style={[styles.diamondContainer, { 
            width: size * 0.4, 
            height: size * 0.4 
          }]}>
            <LinearGradient
              colors={colors.diamond}
              style={[styles.diamond, { 
                width: size * 0.4, 
                height: size * 0.4 
              }]}
            />
          </View>
        </LinearGradient>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  innerCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  diamondContainer: {
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  diamond: {
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
}); 