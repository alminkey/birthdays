import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './keys';

async function readJson(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.warn('[storage] Failed to read key', error);
    return fallback;
  }
}

async function writeJson(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('[storage] Failed to persist key', error);
  }
}

export async function loadBirthdays() {
  return readJson(STORAGE_KEYS.birthdays, []);
}

export async function saveBirthdays(birthdays) {
  await writeJson(STORAGE_KEYS.birthdays, birthdays);
}

export async function loadEvents() {
  return readJson(STORAGE_KEYS.events, []);
}

export async function saveEvents(events) {
  await writeJson(STORAGE_KEYS.events, events);
}

export async function loadOnboardingStatus() {
  return readJson(STORAGE_KEYS.onboarding, { completed: false });
}

export async function saveOnboardingStatus(status) {
  await writeJson(STORAGE_KEYS.onboarding, status);
}

