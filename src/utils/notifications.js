import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CHANNEL_ID = 'celebrations-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function initializeNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Celebration reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      lightColor: '#7D5BA6',
    });
  }
}

export async function ensureNotificationPermission() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') {
    return true;
  }
  const { status: newStatus } = await Notifications.requestPermissionsAsync();
  return newStatus === 'granted';
}

function buildNotificationContent({ title, subtitle, body }) {
  return {
    title,
    subtitle,
    body,
    sound: 'default',
  };
}

export async function scheduleCelebrationNotifications({
  title,
  subtitle,
  body,
  baseDate,
  notifyOffsets = [],
}) {
  if (!baseDate) {
    return [];
  }
  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) {
    return [];
  }
  const identifiers = [];
  for (const offset of notifyOffsets) {
    const triggerDate = new Date(baseDate.getTime());
    triggerDate.setDate(triggerDate.getDate() + offset);
    if (triggerDate <= new Date()) {
      continue;
    }
    const identifier = await Notifications.scheduleNotificationAsync({
      content: buildNotificationContent({ title, subtitle, body }),
      trigger: triggerDate,
    });
    identifiers.push(identifier);
  }
  return identifiers;
}

export async function cancelScheduledNotifications(identifiers = []) {
  await Promise.all(
    identifiers.map((id) => Notifications.cancelScheduledNotificationAsync(id)),
  );
}
