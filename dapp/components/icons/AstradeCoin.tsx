import React from 'react';
import { View, Image, StyleSheet, ImageStyle } from 'react-native';

interface AstradeCoinProps {
  size?: number;
  style?: ImageStyle;
}

export default function AstradeCoin({ 
  size = 20, 
  style 
}: AstradeCoinProps) {
  return (
    <Image
      source={require('../../assets/images/coin_astrade.png')}
      style={[
        styles.coin,
        { width: size, height: size },
        style
      ]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  coin: {
    borderRadius: 50,
  },
}); 