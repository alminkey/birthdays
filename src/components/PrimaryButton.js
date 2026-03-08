import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/colors';

const toneGradients = {
  primary: [theme.primary, theme.primaryAlt],
  accent: [theme.accent, theme.primaryAlt],
  danger: ['#F87171', '#EF4444'],
  muted: [theme.cardBackground, theme.overlay],
};

const toneShadow = {
  primary: theme.primary,
  accent: theme.accent,
  danger: '#F43F5E',
  muted: theme.cardBorder,
};

export default function PrimaryButton({ label, onPress, style, icon, disabled = false, tone = 'primary' }) {
  const gradientColors = disabled
    ? [theme.cardBackground, theme.cardBackground]
    : toneGradients[tone] ?? toneGradients.primary;
  const shadowColor = toneShadow[tone] ?? toneShadow.primary;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrapper,
        { shadowColor },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.gradient, disabled && styles.disabledGradient]}
      >
        <View style={styles.content}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text style={styles.label}>{label}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowOpacity: 0.32,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.24,
  },
  disabled: {
    shadowOpacity: 0.12,
  },
  disabledGradient: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    width: 20,
    height: 20,
  },
  label: {
    color: theme.primaryText,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
