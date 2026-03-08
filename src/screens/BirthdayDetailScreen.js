import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Linking, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Avatar from '../components/Avatar';
import Card from '../components/Card';
import PhotoGallery from '../components/PhotoGallery';
import PrimaryButton from '../components/PrimaryButton';
import { useCelebrations } from '../context/CelebrationsContext';
import { formatDisplayDate, formatCountdown, getDaysUntil, getUpcomingAge, getCurrentAge } from '../utils/date';
import { theme } from '../theme/colors';

export default function BirthdayDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { birthdays, removeBirthday } = useCelebrations();
  const { id } = route.params ?? {};

  const birthday = useMemo(() => birthdays.find((item) => item.id === id), [birthdays, id]);

  if (!birthday) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.fallback}>
          <Text style={styles.fallbackText}>Birthday not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const daysUntil = getDaysUntil(birthday.date);
  const upcomingAge = getUpcomingAge(birthday.date);
  const currentAge = getCurrentAge(birthday.date);

  const handleEdit = () => {
    navigation.navigate('AddBirthday', { id: birthday.id });
  };

  const handleCall = () => {
    const phone = birthday.contact?.phone;
    if (phone) {
      Linking.openURL('tel:' + phone);
    } else {
      Alert.alert('No phone number saved');
    }
  };

  const handleMessage = () => {
    const phone = birthday.contact?.phone;
    if (phone) {
      Linking.openURL('sms:' + phone);
    } else {
      Alert.alert('No phone number saved');
    }
  };

  const handleRemove = async () => {
    Alert.alert('Remove birthday', 'Are you sure you want to remove this birthday?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await removeBirthday(birthday.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const readableOffsets = birthday.notifyOffsets
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
        <View style={styles.hero}>
          <Avatar uri={birthday.photoUri} photoUris={birthday.photoUris} name={birthday.name} size={96} />
          <Text style={styles.name}>{birthday.name}</Text>
          <Text style={styles.date}>{formatDisplayDate(birthday.date, 'MMMM D')}</Text>
          <Text style={styles.countdown}>{formatCountdown(daysUntil)}</Text>
          {upcomingAge ? (
            <Text style={styles.age}>Turning {upcomingAge} | Currently {currentAge}</Text>
          ) : null}
        </View>

        {birthday.photoUris?.length ? <PhotoGallery uris={birthday.photoUris} /> : null}

        <PrimaryButton label='Edit birthday' onPress={handleEdit} tone='accent' />

        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.bodyText}>{birthday.notes || 'No notes yet.'}</Text>
          <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Gift idea</Text>
          <Text style={styles.bodyText}>{birthday.giftIdea || 'Add an inspiring gift idea to keep it handy.'}</Text>
          <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Reminder timing</Text>
          <Text style={styles.bodyText}>{readableOffsets}</Text>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.actionsRow}>
            <PrimaryButton label='Call' onPress={handleCall} style={styles.smallButton} />
            <PrimaryButton label='Message' onPress={handleMessage} style={styles.smallButton} />
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Gift timeline</Text>
          {birthday.giftHistory?.length ? (
            birthday.giftHistory.map((entry) => (
              <View key={entry.id} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineDate}>{formatDisplayDate(entry.giftedOn)}</Text>
                  <Text style={styles.bodyText}>{entry.description}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.bodyText}>No gifts recorded yet. Add previous presents to build a memory lane.</Text>
          )}
        </Card>

        <PrimaryButton label='Remove birthday' onPress={handleRemove} tone='danger' />
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
  hero: {
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
  },
  date: {
    color: theme.mutedText,
  },
  countdown: {
    color: theme.primary,
    fontWeight: '600',
  },
  age: {
    color: theme.mutedText,
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
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallButton: {
    flex: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.primary,
    marginTop: 6,
  },
  timelineContent: {
    flex: 1,
    gap: 4,
  },
  timelineDate: {
    fontWeight: '600',
    color: theme.text,
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




