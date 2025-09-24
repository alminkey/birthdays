import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/colors';

export default function FilterChip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.active,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.chipBackground,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  active: {
    backgroundColor: theme.accentSoft,
    borderColor: theme.accent,
  },
  pressed: {
    opacity: 0.9,
  },
  label: {
    color: theme.mutedText,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  activeLabel: {
    color: theme.primaryText,
  },
});
