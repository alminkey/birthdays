import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { theme } from '../theme/colors';

export default function EmptyState({ title, description, illustration }) {
  return (
    <View style={styles.container}>
      {illustration ? <Image source={illustration} style={styles.illustration} resizeMode="contain" /> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  illustration: {
    width: 160,
    height: 160,
    opacity: 0.9,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    textAlign: 'center',
  },
  description: {
    color: theme.mutedText,
    textAlign: 'center',
  },
});
