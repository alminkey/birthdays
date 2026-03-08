import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import {
  loadBirthdays,
  saveBirthdays,
  loadEvents,
  saveEvents,
  loadOnboardingStatus,
  saveOnboardingStatus,
} from '../storage/storage';
import { DEFAULT_NOTIFY_OFFSETS } from '../types';
import { createId } from '../utils/id';
import { getNextBirthdayOccurrence, sortBirthdaysByNextOccurrence } from '../utils/date';
import {
  initializeNotifications,
  scheduleCelebrationNotifications,
  cancelScheduledNotifications,
} from '../utils/notifications';

const CelebrationsContext = createContext({
  birthdays: [],
  events: [],
  loading: true,
  onboardingComplete: false,
  setOnboardingComplete: async () => {},
  addBirthday: async () => {},
  updateBirthday: async () => {},
  removeBirthday: async () => {},
  addEvent: async () => {},
  updateEvent: async () => {},
  removeEvent: async () => {},
  upcomingBirthdays: [],
  upcomingEvents: [],
});

function withDefaultOffsets(notifyOffsets) {
  return Array.isArray(notifyOffsets) && notifyOffsets.length > 0
    ? notifyOffsets
    : DEFAULT_NOTIFY_OFFSETS;
}

function sanitizePhotoArray(value) {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.filter((uri) => typeof uri === 'string' && uri.trim().length > 0);
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return [value];
  }
  return [];
}

function normalizeBirthday(record) {
  if (!record) {
    return null;
  }
  const photoUris = sanitizePhotoArray(record.photoUris ?? record.photoUri);
  return {
    ...record,
    photoUris,
    photoUri: photoUris[0] ?? null,
    notifyOffsets: withDefaultOffsets(record.notifyOffsets),
    giftHistory: Array.isArray(record.giftHistory) ? record.giftHistory : [],
    contact: record.contact ?? {},
    notificationIds: Array.isArray(record.notificationIds) ? record.notificationIds : [],
  };
}

function normalizeEvent(record) {
  if (!record) {
    return null;
  }
  const photoUris = sanitizePhotoArray(record.photoUris);
  return {
    ...record,
    photoUris,
    notifyOffsets: withDefaultOffsets(record.notifyOffsets),
    repeatRule: record.repeatRule ?? { frequency: 'none' },
    notificationIds: Array.isArray(record.notificationIds) ? record.notificationIds : [],
  };
}

export function CelebrationsProvider({ children }) {
  const [birthdays, setBirthdays] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);

  useEffect(() => {
    initializeNotifications().catch((error) => console.warn('[notifications] init failed', error));
    (async () => {
      try {
        const [storedBirthdays, storedEvents, onboarding] = await Promise.all([
          loadBirthdays(),
          loadEvents(),
          loadOnboardingStatus(),
        ]);
        setBirthdays((storedBirthdays ?? []).map(normalizeBirthday).filter(Boolean));
        setEvents((storedEvents ?? []).map(normalizeEvent).filter(Boolean));
        setOnboardingCompleteState(Boolean(onboarding?.completed));
      } catch (error) {
        console.warn('[context] failed to hydrate data', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persistBirthdays = useCallback((updater) => {
    setBirthdays((prev) => {
      const base = typeof updater === 'function' ? updater(prev) : updater;
      const next = (base ?? []).map(normalizeBirthday).filter(Boolean);
      saveBirthdays(next).catch((error) => console.warn('[storage] saveBirthdays failed', error));
      return next;
    });
  }, []);

  const persistEvents = useCallback((updater) => {
    setEvents((prev) => {
      const base = typeof updater === 'function' ? updater(prev) : updater;
      const next = (base ?? []).map(normalizeEvent).filter(Boolean);
      saveEvents(next).catch((error) => console.warn('[storage] saveEvents failed', error));
      return next;
    });
  }, []);

  const setOnboardingComplete = useCallback(async (completed) => {
    setOnboardingCompleteState(completed);
    await saveOnboardingStatus({ completed });
  }, []);

  const addBirthday = useCallback(
    async (input) => {
      const id = createId('birthday');
      const basePhotoUris = sanitizePhotoArray(input.photoUris ?? input.photoUri);
      const record = normalizeBirthday({
        id,
        name: input.name?.trim() ?? 'Unnamed',
        date: input.date,
        photoUris: basePhotoUris,
        giftIdea: input.giftIdea ?? '',
        notes: input.notes ?? '',
        notifyOffsets: withDefaultOffsets(input.notifyOffsets),
        category: input.category ?? 'other',
        giftHistory: input.giftHistory ?? [],
        contact: input.contact ?? {},
        notificationIds: [],
      });
      try {
        const upcomingDate = getNextBirthdayOccurrence(record.date).toDate();
        const notificationIds = await scheduleCelebrationNotifications({
          title: `${record.name}'s birthday`,
          subtitle: 'Birthday reminder',
          body: 'Celebrate and send your wishes!',
          baseDate: upcomingDate,
          notifyOffsets: record.notifyOffsets,
        });
        const withNotifications = normalizeBirthday({ ...record, notificationIds });
        persistBirthdays((prev) => [...prev, withNotifications]);
        return withNotifications;
      } catch (error) {
        console.warn('[notifications] schedule birthday failed', error);
        persistBirthdays((prev) => [...prev, record]);
        return record;
      }
    },
    [persistBirthdays],
  );

  const updateBirthday = useCallback(
    async (id, updates) => {
      let updatedRecord = null;
      persistBirthdays((prev) => {
        const next = prev.map((item) => {
          if (item.id !== id) {
            return item;
          }
          const merged = {
            ...item,
            ...updates,
            notifyOffsets: withDefaultOffsets(updates?.notifyOffsets ?? item.notifyOffsets),
            photoUris: sanitizePhotoArray(updates?.photoUris ?? item.photoUris),
          };
          updatedRecord = normalizeBirthday(merged);
          return updatedRecord;
        });
        return next;
      });
      if (!updatedRecord) {
        return null;
      }
      try {
        await cancelScheduledNotifications(updatedRecord.notificationIds);
        const upcomingDate = getNextBirthdayOccurrence(updatedRecord.date).toDate();
        const notificationIds = await scheduleCelebrationNotifications({
          title: `${updatedRecord.name}'s birthday`,
          subtitle: 'Birthday reminder',
          body: 'Celebrate and send your wishes!',
          baseDate: upcomingDate,
          notifyOffsets: updatedRecord.notifyOffsets,
        });
        const withNotifications = normalizeBirthday({ ...updatedRecord, notificationIds });
        persistBirthdays((prev) => prev.map((item) => (item.id === id ? withNotifications : item)));
        return withNotifications;
      } catch (error) {
        console.warn('[notifications] reschedule birthday failed', error);
      }
      return updatedRecord;
    },
    [persistBirthdays],
  );

  const removeBirthday = useCallback(
    async (id) => {
      let removedRecord = null;
      persistBirthdays((prev) => {
        const next = prev.filter((item) => {
          if (item.id === id) {
            removedRecord = item;
            return false;
          }
          return true;
        });
        return next;
      });
      if (removedRecord) {
        await cancelScheduledNotifications(removedRecord.notificationIds);
      }
    },
    [persistBirthdays],
  );

  const addEvent = useCallback(
    async (input) => {
      const id = createId('event');
      const basePhotoUris = sanitizePhotoArray(input.photoUris);
      const record = normalizeEvent({
        id,
        title: input.title?.trim() ?? 'Untitled event',
        datetime: input.datetime,
        location: input.location ?? '',
        notes: input.notes ?? '',
        notifyOffsets: withDefaultOffsets(input.notifyOffsets),
        repeatRule: input.repeatRule ?? { frequency: 'none' },
        photoUris: basePhotoUris,
        notificationIds: [],
      });
      try {
        const baseDate = new Date(record.datetime);
        const notificationIds = await scheduleCelebrationNotifications({
          title: record.title,
          subtitle: 'Event reminder',
          body: record.notes || 'A scheduled event is coming up.',
          baseDate,
          notifyOffsets: record.notifyOffsets,
        });
        const withNotifications = normalizeEvent({ ...record, notificationIds });
        persistEvents((prev) => [...prev, withNotifications]);
        return withNotifications;
      } catch (error) {
        console.warn('[notifications] schedule event failed', error);
        persistEvents((prev) => [...prev, record]);
        return record;
      }
    },
    [persistEvents],
  );

  const updateEvent = useCallback(
    async (id, updates) => {
      let updatedRecord = null;
      persistEvents((prev) => {
        const next = prev.map((item) => {
          if (item.id !== id) {
            return item;
          }
          const merged = {
            ...item,
            ...updates,
            notifyOffsets: withDefaultOffsets(updates?.notifyOffsets ?? item.notifyOffsets),
            photoUris: sanitizePhotoArray(updates?.photoUris ?? item.photoUris),
            repeatRule: updates?.repeatRule ?? item.repeatRule ?? { frequency: 'none' },
          };
          updatedRecord = normalizeEvent(merged);
          return updatedRecord;
        });
        return next;
      });
      if (!updatedRecord) {
        return null;
      }
      try {
        await cancelScheduledNotifications(updatedRecord.notificationIds);
        const baseDate = new Date(updatedRecord.datetime);
        const notificationIds = await scheduleCelebrationNotifications({
          title: updatedRecord.title,
          subtitle: 'Event reminder',
          body: updatedRecord.notes || 'A scheduled event is coming up.',
          baseDate,
          notifyOffsets: updatedRecord.notifyOffsets,
        });
        const withNotifications = normalizeEvent({ ...updatedRecord, notificationIds });
        persistEvents((prev) => prev.map((item) => (item.id === id ? withNotifications : item)));
        return withNotifications;
      } catch (error) {
        console.warn('[notifications] reschedule event failed', error);
      }
      return updatedRecord;
    },
    [persistEvents],
  );

  const removeEvent = useCallback(
    async (id) => {
      let removedRecord = null;
      persistEvents((prev) => {
        const next = prev.filter((item) => {
          if (item.id === id) {
            removedRecord = item;
            return false;
          }
          return true;
        });
        return next;
      });
      if (removedRecord) {
        await cancelScheduledNotifications(removedRecord.notificationIds);
      }
    },
    [persistEvents],
  );

  const upcomingBirthdays = useMemo(() => sortBirthdaysByNextOccurrence(birthdays), [birthdays]);

  const upcomingEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  }, [events]);

  const value = useMemo(
    () => ({
      birthdays,
      events,
      loading,
      onboardingComplete,
      setOnboardingComplete,
      addBirthday,
      updateBirthday,
      removeBirthday,
      addEvent,
      updateEvent,
      removeEvent,
      upcomingBirthdays,
      upcomingEvents,
    }),
    [
      birthdays,
      events,
      loading,
      onboardingComplete,
      setOnboardingComplete,
      addBirthday,
      updateBirthday,
      removeBirthday,
      addEvent,
      updateEvent,
      removeEvent,
      upcomingBirthdays,
      upcomingEvents,
    ],
  );

  return <CelebrationsContext.Provider value={value}>{children}</CelebrationsContext.Provider>;
}

export function useCelebrations() {
  const context = useContext(CelebrationsContext);
  if (!context) {
    Alert.alert('Celebrations context missing');
    throw new Error('useCelebrations must be used within a CelebrationsProvider');
  }
  return context;
}

export default CelebrationsContext;


