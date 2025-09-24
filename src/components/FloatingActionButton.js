import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/colors';

export default function FloatingActionButton({ label, onPress }) {
  return (
    <Pressable style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]} onPress={onPress}>
      <LinearGradient colors={[theme.primary, theme.primaryAlt]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.gradient}>
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: theme.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  gradient: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: theme.primaryText,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
