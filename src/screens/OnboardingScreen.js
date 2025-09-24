import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { theme } from '../theme/colors';
import { useCelebrations } from '../context/CelebrationsContext';

const featureList = [
  'Track birthdays and personal events in one place',
  'Get gentle reminders the day before and on the day',
  'Save gift ideas and personal notes for each person',
];

export default function OnboardingScreen({ navigation }) {
  const { setOnboardingComplete } = useCelebrations();

  const handleContinue = async () => {
    await setOnboardingComplete(true);
    navigation.replace('MainTabs');
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/icon.png')} style={styles.hero} />
      <Text style={styles.title}>Welcome to Birthday Companion</Text>
      <Text style={styles.subtitle}>Never miss a celebration again.</Text>
      <View style={styles.features}>
        {featureList.map((feature) => (
          <View key={feature} style={styles.featureItem}>
            <View style={styles.bullet} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
      <PrimaryButton label="Get started" onPress={handleContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    backgroundColor: theme.background,
  },
  hero: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.mutedText,
    textAlign: 'center',
  },
  features: {
    width: '100%',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.accent,
  },
  featureText: {
    flex: 1,
    color: theme.text,
  },
});

