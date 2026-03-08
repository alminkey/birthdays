import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCelebrations } from '../context/CelebrationsContext';
import { theme } from '../theme/colors';
import SectionHeader from '../components/SectionHeader';
import BirthdayCard from '../components/BirthdayCard';
import EventCard from '../components/EventCard';
import PrimaryButton from '../components/PrimaryButton';
import EmptyState from '../components/EmptyState';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { upcomingBirthdays, upcomingEvents } = useCelebrations();

  const nextBirthdays = upcomingBirthdays.slice(0, 3);
  const nextEvents = upcomingEvents.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={theme.heroGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Your personal concierge</Text>
          </View>
          <Text style={styles.title}>Stay ahead of every celebration</Text>
          <Text style={styles.subtitle}>
            Curate heartfelt moments with reminders, gift ideas, and elegant planning tools.
          </Text>
          <View style={styles.actions}>
            <PrimaryButton label="Add birthday" onPress={() => navigation.navigate('AddBirthday')} />
            <PrimaryButton
              label="Add event"
              tone="accent"
              onPress={() => navigation.navigate('AddEvent')}
              style={styles.secondaryButton}
            />
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <SectionHeader
            title="Next birthdays"
            action={
              <Text style={styles.link} onPress={() => navigation.navigate('Birthdays')}>
                View all
              </Text>
            }
          />
          {nextBirthdays.length === 0 ? (
            <EmptyState
              title="No birthdays yet"
              description="Add your first birthday to receive timely reminders."
            />
          ) : (
            nextBirthdays.map((birthday) => (
              <BirthdayCard
                key={birthday.id}
                item={birthday}
                onPress={() => navigation.navigate('BirthdayDetail', { id: birthday.id })}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Upcoming events"
            action={
              <Text style={styles.link} onPress={() => navigation.navigate('Events')}>
                View all
              </Text>
            }
          />
          {nextEvents.length === 0 ? (
            <EmptyState
              title="No events scheduled"
              description="Create an event to keep track of important dates."
            />
          ) : (
            nextEvents.map((event) => (
              <EventCard
                key={event.id}
                item={event}
                onPress={() => navigation.navigate('EventDetail', { id: event.id })}
              />
            ))
          )}
        </View>
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
    padding: 28,
    paddingBottom: 64,
    gap: 32,
  },
  hero: {
    borderRadius: 28,
    padding: 28,
    gap: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeText: {
    color: theme.primaryText,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: theme.primaryText,
    letterSpacing: 0.4,
  },
  subtitle: {
    color: theme.text,
    opacity: 0.85,
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  secondaryButton: {
    shadowOpacity: 0.25,
  },
  section: {
    gap: 16,
  },
  link: {
    color: theme.accent,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
