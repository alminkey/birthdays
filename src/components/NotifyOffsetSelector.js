import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../theme/colors';

const CHOICES = [
  { label: 'Same day', value: 0 },
  { label: '1 day before', value: -1 },
  { label: '2 days before', value: -2 },
  { label: '1 week before', value: -7 },
];

export default function NotifyOffsetSelector({ values, onChange }) {
  const toggleValue = (value) => {
    const hasValue = values.includes(value);
    if (hasValue) {
      onChange(values.filter((item) => item !== value));
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Reminder timing</Text>
      <View style={styles.chips}>
        {CHOICES.map((choice) => {
          const active = values.includes(choice.value);
          return (
            <Pressable
              key={choice.value}
              onPress={() => toggleValue(choice.value)}
              style={[styles.chip, active && styles.activeChip]}
            >
              <Text style={[styles.chipLabel, active && styles.activeChipLabel]}>{choice.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: theme.chipBackground,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  activeChip: {
    backgroundColor: theme.accentSoft,
    borderColor: theme.accent,
  },
  chipLabel: {
    color: theme.mutedText,
    fontWeight: '500',
  },
  activeChipLabel: {
    color: theme.primaryText,
    fontWeight: '600',
  },
});
