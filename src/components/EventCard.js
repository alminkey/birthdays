import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Card from './Card';
import { formatDisplayTime } from '../utils/date';
import { theme } from '../theme/colors';

export default function EventCard({ item, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <Card style={styles.card}>
        <LinearGradient colors={[theme.primary, theme.accent]} style={styles.accentBar} />
        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{formatDisplayTime(item.datetime)}</Text>
          {item.location ? <Text style={styles.location}>{item.location}</Text> : null}
          {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  accentBar: {
    width: 5,
    borderRadius: 999,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.text,
    letterSpacing: 0.3,
  },
  subtitle: {
    color: theme.mutedText,
  },
  location: {
    color: theme.accent,
    fontWeight: '600',
  },
  notes: {
    color: theme.mutedText,
    fontStyle: 'italic',
  },
  pressed: {
    opacity: 0.9,
  },
});
