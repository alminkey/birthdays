import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, FlatList, StyleSheet, Switch, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCelebrations } from '../context/CelebrationsContext';
import SearchInput from '../components/SearchInput';
import SectionHeader from '../components/SectionHeader';
import EventCard from '../components/EventCard';
import EmptyState from '../components/EmptyState';
import FloatingActionButton from '../components/FloatingActionButton';
import { theme } from '../theme/colors';

export default function EventsScreen() {
  const navigation = useNavigation();
  const { upcomingEvents } = useCelebrations();
  const [query, setQuery] = useState('');
  const [onlyUpcoming, setOnlyUpcoming] = useState(true);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    return upcomingEvents.filter((event) => {
      const matchesQuery = event.title.toLowerCase().includes(query.toLowerCase());
      const matchesUpcoming = !onlyUpcoming || new Date(event.datetime) >= now;
      return matchesQuery && matchesUpcoming;
    });
  }, [upcomingEvents, query, onlyUpcoming]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <SectionHeader title="Events" />
        <SearchInput value={query} onChangeText={setQuery} placeholder="Search by title" />
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Upcoming only</Text>
          <Switch
            value={onlyUpcoming}
            onValueChange={setOnlyUpcoming}
            thumbColor={onlyUpcoming ? theme.primaryText : theme.cardBorder}
            trackColor={{ false: theme.overlay, true: theme.accentSoft }}
            ios_backgroundColor={theme.overlay}
          />
        </View>
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={filteredEvents.length === 0 ? styles.emptyListContent : undefined}
          renderItem={({ item }) => (
            <EventCard
              item={item}
              onPress={() => navigation.navigate('EventDetail', { id: item.id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="No events found"
              description="Add an event or adjust your filters."
            />
          }
          showsVerticalScrollIndicator={false}
        />
        <FloatingActionButton label="Add event" onPress={() => navigation.navigate('AddEvent')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    flex: 1,
    padding: 24,
    paddingBottom: 80,
    gap: 16,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterLabel: {
    color: theme.text,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  emptyListContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
