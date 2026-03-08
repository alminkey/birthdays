import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../theme/colors';

export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.cardBackground,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 18 },
    elevation: 6,
  },
});
