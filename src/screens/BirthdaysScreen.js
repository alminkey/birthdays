import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCelebrations } from '../context/CelebrationsContext';
import SearchInput from '../components/SearchInput';
import SectionHeader from '../components/SectionHeader';
import BirthdayCard from '../components/BirthdayCard';
import EmptyState from '../components/EmptyState';
import FilterChip from '../components/FilterChip';
import FloatingActionButton from '../components/FloatingActionButton';
import { theme } from '../theme/colors';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Family', value: 'family' },
  { label: 'Friends', value: 'friends' },
  { label: 'Work', value: 'work' },
  { label: 'Other', value: 'other' },
];

export default function BirthdaysScreen() {
  const navigation = useNavigation();
  const { upcomingBirthdays } = useCelebrations();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredBirthdays = useMemo(() => {
    return upcomingBirthdays.filter((birthday) => {
      const matchesQuery = birthday.name.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === 'all' || birthday.category === filter;
      return matchesQuery && matchesFilter;
    });
  }, [upcomingBirthdays, query, filter]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <SectionHeader title="Birthdays" />
        <SearchInput value={query} onChangeText={setQuery} placeholder="Search by name" />
        <View style={styles.filters}>
          {FILTERS.map((item) => (
            <FilterChip
              key={item.value}
              label={item.label}
              active={filter === item.value}
              onPress={() => setFilter(item.value)}
            />
          ))}
        </View>
        <FlatList
          data={filteredBirthdays}
          keyExtractor={(item) => item.id}
          contentContainerStyle={filteredBirthdays.length === 0 ? styles.emptyListContent : undefined}
          renderItem={({ item }) => (
            <BirthdayCard
              item={item}
              onPress={() => navigation.navigate('BirthdayDetail', { id: item.id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="No birthdays found"
              description="Add a birthday or adjust your filters."
            />
          }
          showsVerticalScrollIndicator={false}
        />
        <FloatingActionButton label="Add birthday" onPress={() => navigation.navigate('AddBirthday')} />
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
  },
  filters: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  emptyListContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

