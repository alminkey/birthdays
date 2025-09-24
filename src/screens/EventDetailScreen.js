import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Linking, Alert, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Card from '../components/Card';
import PhotoGallery from '../components/PhotoGallery';
import PrimaryButton from '../components/PrimaryButton';
import { useCelebrations } from '../context/CelebrationsContext';
import { formatDisplayTime } from '../utils/date';
import { theme } from '../theme/colors';

export default function EventDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { events, removeEvent } = useCelebrations();
  const { id } = route.params ?? {};

  const event = useMemo(() => events.find((item) => item.id === id), [events, id]);

  if (!event) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>Event not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleEdit = () => {
    navigation.navigate('AddEvent', { id: event.id });
  };

  const handleOpenLocation = () => {
    if (!event.location) {
      Alert.alert('No location saved');
      return;
    }
    const encoded = encodeURIComponent(event.location);
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${encoded}`,
      android: `geo:0,0?q=${encoded}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encoded}`,
    });
    if (url) {
      Linking.openURL(url);
    }
  };

  const handleRemove = async () => {
    Alert.alert('Remove event', 'Are you sure you want to remove this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await removeEvent(event.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const readableOffsets = event.notifyOffsets
    .map((offset) => {
      if (offset === 0) {
        return 'On the day';
      }
      const abs = Math.abs(offset);
      const unit = abs === 1 ? 'day' : 'days';
      return `${abs} ${unit} ${offset < 0 ? 'before' : 'after'}`;
    })
    .join(', ');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.subtitle}>{formatDisplayTime(event.datetime)}</Text>
          {event.location ? <Text style={styles.location}>{event.location}</Text> : null}
        </View>

        {event.photoUris?.length ? <PhotoGallery uris={event.photoUris} /> : null}

        <PrimaryButton label="Edit event" onPress={handleEdit} tone="accent" />

        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.bodyText}>{event.notes || 'No notes yet.'}</Text>
          <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Reminder timing</Text>
          <Text style={styles.bodyText}>{readableOffsets}</Text>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Repeat rule</Text>
          <Text style={styles.bodyText}>
            {event.repeatRule?.frequency === 'none'
              ? 'Does not repeat'
              : `${event.repeatRule?.frequency ?? 'none'}${
                  event.repeatRule?.interval ? ` every ${event.repeatRule.interval}` : ''
                }`}
          </Text>
        </Card>

        {event.location ? (
          <PrimaryButton label="Open in maps" onPress={handleOpenLocation} />
        ) : null}

        <PrimaryButton label="Remove event" onPress={handleRemove} tone="danger" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    padding: 24,
    gap: 24,
    paddingBottom: 80,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
  },
  subtitle: {
    color: theme.mutedText,
  },
  location: {
    color: theme.primary,
    fontWeight: '600',
  },
  infoCard: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
  },
  sectionSpacing: {
    marginTop: 12,
  },
  bodyText: {
    color: theme.mutedText,
    lineHeight: 20,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: theme.mutedText,
  },
});
