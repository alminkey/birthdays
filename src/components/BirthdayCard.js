import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Card from './Card';
import Avatar from './Avatar';
import { formatCountdown, getDaysUntil, formatDisplayDate } from '../utils/date';
import { theme } from '../theme/colors';

export default function BirthdayCard({ item, onPress }) {
  const daysUntil = getDaysUntil(item.date);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <Card style={styles.card}>
        <Avatar uri={item.photoUri} photoUris={item.photoUris} name={item.name} size={64} />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.countdownPill}>
              <Text style={styles.countdownText}>{formatCountdown(daysUntil)}</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>{formatDisplayDate(item.date, 'MMMM D')}</Text>
          {item.giftIdea ? (
            <View style={styles.giftPill}>
              <Text style={styles.giftLabel}>Gift idea</Text>
              <Text style={styles.giftValue}>{item.giftIdea}</Text>
            </View>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 18,
  },
  content: {
    flex: 1,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  subtitle: {
    color: theme.mutedText,
    fontSize: 14,
  },
  countdownPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: theme.accent,
    backgroundColor: theme.accentSoft,
  },
  countdownText: {
    color: theme.primaryText,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  giftPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.overlay,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  giftLabel: {
    color: theme.accent,
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  giftValue: {
    flex: 1,
    color: theme.text,
  },
  pressed: {
    opacity: 0.9,
  },
});

