import React from 'react';
import { View, StyleSheet } from 'react-native';

export function Card({ children, style }: any) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export const theme = {
  cardBg: '#FFFFFF',
  cardRadius: 12,
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    // basic shadow for iOS/Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
});
