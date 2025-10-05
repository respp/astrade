import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  paddingTop?: number;
}

export default function ScreenWrapper({ 
  children, 
  style, 
  paddingTop = 90 // Account for compact navbar height + safe area
}: ScreenWrapperProps) {
  return (
    <View style={[styles.container, { paddingTop }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 