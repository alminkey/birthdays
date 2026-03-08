import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
  Image,
} from 'react-native';
import dayjs from 'dayjs';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCelebrations } from '../context/CelebrationsContext';
import { DEFAULT_NOTIFY_OFFSETS } from '../types';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import NotifyOffsetSelector from '../components/NotifyOffsetSelector';
import FilterChip from '../components/FilterChip';
import Card from '../components/Card';
import { theme } from '../theme/colors';

const FREQUENCIES = [
  { label: 'No repeat', value: 'none' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

const MAX_PHOTOS = 10;

function uniqueUris(list) {
  return Array.from(new Set(list.filter((uri) => typeof uri === 'string' && uri.trim().length > 0)));
}

export default function AddEventScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const editingId = route.params?.id;
  const isEditing = Boolean(editingId);

  const { events, addEvent, updateEvent } = useCelebrations();
  const existing = useMemo(() => events.find((item) => item.id === editingId), [events, editingId]);
  const hydrated = useRef(false);

  useEffect(() => {
    hydrated.current = false;
  }, [editingId]);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [notifyOffsets, setNotifyOffsets] = useState([...DEFAULT_NOTIFY_OFFSETS]);
  const [repeatFrequency, setRepeatFrequency] = useState('none');
  const [repeatInterval, setRepeatInterval] = useState('1');
  const [photoUris, setPhotoUris] = useState([]);

  useEffect(() => {
    if (isEditing && existing && !hydrated.current) {
      setTitle(existing.title ?? '');
      const existingDate = dayjs(existing.datetime);
      setDate(existingDate.toDate());
      setTime(existingDate.toDate());
      setLocation(existing.location ?? '');
      setNotes(existing.notes ?? '');
      setNotifyOffsets(existing.notifyOffsets ?? DEFAULT_NOTIFY_OFFSETS);
      setRepeatFrequency(existing.repeatRule?.frequency ?? 'none');
      setRepeatInterval(String(existing.repeatRule?.interval ?? 1));
      setPhotoUris(uniqueUris(existing.photoUris ?? []));
      hydrated.current = true;
    }
  }, [isEditing, existing]);

  const combinedDateTime = dayjs(date)
    .hour(dayjs(time).hour())
    .minute(dayjs(time).minute())
    .second(0)
    .millisecond(0)
    .toDate();

  const handlePickDate = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: date,
        mode: 'date',
        onChange: (_, selectedDate) => {
          if (selectedDate) {
            setDate(selectedDate);
          }
        },
      });
    } else {
      setShowDatePicker(true);
    }
  };

  const handlePickTime = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: time,
        mode: 'time',
        is24Hour: true,
        onChange: (_, selectedTime) => {
          if (selectedTime) {
            setTime(selectedTime);
          }
        },
      });
    } else {
      setShowTimePicker(true);
    }
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to attach images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      allowsMultipleSelection: true,
      quality: 0.85,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled) {
      const picked = result.assets?.map((asset) => asset.uri) ?? [];
      setPhotoUris((prev) => uniqueUris([...prev, ...picked]).slice(0, MAX_PHOTOS));
    }
  };

  const capturePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled) {
      const picked = result.assets?.map((asset) => asset.uri) ?? [];
      setPhotoUris((prev) => uniqueUris([...prev, ...picked]).slice(0, MAX_PHOTOS));
    }
  };

  const handleAddPhoto = () => {
    if (photoUris.length >= MAX_PHOTOS) {
      Alert.alert('Maximum reached', 'You can attach up to ' + MAX_PHOTOS + ' photos.');
      return;
    }
    Alert.alert('Add photo', 'Choose a source', [
      { text: 'Camera', onPress: capturePhoto },
      { text: 'Photo library', onPress: pickFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRemovePhoto = (index) => {
    setPhotoUris((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please add a title before saving.');
      return;
    }

    const payload = {
      title: title.trim(),
      datetime: dayjs(combinedDateTime).toISOString(),
      location,
      notes,
      notifyOffsets: [...notifyOffsets],
      repeatRule: {
        frequency: repeatFrequency,
        interval: Number(repeatInterval) || 1,
      },
      photoUris: uniqueUris(photoUris),
    };

    if (isEditing) {
      if (!existing) {
        Alert.alert('Not found', 'This event could not be loaded for editing.');
        return;
      }
      await updateEvent(existing.id, payload);
    } else {
      await addEvent(payload);
    }
    navigation.goBack();
  };

  if (isEditing && !existing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.missingContainer}>
          <Text style={styles.missingText}>This event is no longer available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const canSubmit = Boolean(title.trim());

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <Text style={styles.heading}>{isEditing ? 'Edit event' : 'Add event'}</Text>
          <InputField label="Title" value={title} onChangeText={setTitle} placeholder="Event title" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{dayjs(date).format('MMMM D, YYYY')}</Text>
            </View>
            <Pressable style={styles.button} onPress={handlePickDate}>
              <Text style={styles.buttonText}>Select date</Text>
            </Pressable>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Time</Text>
              <Text style={styles.value}>{dayjs(time).format('HH:mm')}</Text>
            </View>
            <Pressable style={styles.button} onPress={handlePickTime}>
              <Text style={styles.buttonText}>Select time</Text>
            </Pressable>
          </View>
          {showDatePicker ? (
            <DateTimePicker
              value={date}
              mode="date"
              display="inline"
              onChange={(_, selectedDate) => {
                if (selectedDate) {
                  setDate(selectedDate);
                }
                setShowDatePicker(false);
              }}
            />
          ) : null}
          {showTimePicker ? (
            <DateTimePicker
              value={time}
              mode="time"
              display="spinner"
              onChange={(_, selectedTime) => {
                if (selectedTime) {
                  setTime(selectedTime);
                }
                setShowTimePicker(false);
              }}
            />
          ) : null}
          <InputField label="Location" value={location} onChangeText={setLocation} placeholder="Optional" />
          <InputField label="Notes" value={notes} onChangeText={setNotes} placeholder="Add notes" multiline />
          <NotifyOffsetSelector values={notifyOffsets} onChange={setNotifyOffsets} />
          <Text style={styles.label}>Repeat</Text>
          <View style={styles.chipsRow}>
            {FREQUENCIES.map((item) => (
              <FilterChip
                key={item.value}
                label={item.label}
                active={repeatFrequency === item.value}
                onPress={() => setRepeatFrequency(item.value)}
              />
            ))}
          </View>
          {repeatFrequency !== 'none' ? (
            <InputField
              label="Repeat every"
              value={repeatInterval}
              onChangeText={setRepeatInterval}
              placeholder="1"
            />
          ) : null}
          <Text style={styles.label}>Photos</Text>
          <ScrollView
            horizontal
            contentContainerStyle={styles.photoStrip}
            showsHorizontalScrollIndicator={false}
          >
            {photoUris.map((uri, index) => (
              <View key={`${uri}-${index}`} style={styles.photoWrapper}>
                <Image source={{ uri }} style={styles.photo} />
                <Pressable style={styles.removePhoto} onPress={() => handleRemovePhoto(index)}>
                  <MaterialCommunityIcons name="close" size={16} color={theme.primaryText} />
                </Pressable>
              </View>
            ))}
            {photoUris.length < MAX_PHOTOS ? (
              <Pressable style={styles.addPhotoTile} onPress={handleAddPhoto}>
                <MaterialCommunityIcons name="plus" size={24} color={theme.primaryText} />
                <Text style={styles.addPhotoText}>Add photo</Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </Card>
        <PrimaryButton
          label={isEditing ? 'Save changes' : 'Save event'}
          onPress={handleSubmit}
          disabled={!canSubmit}
        />
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
  card: {
    gap: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  value: {
    color: theme.text,
    fontWeight: '600',
  },
  button: {
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  buttonText: {
    color: theme.primaryText,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoStrip: {
    gap: 16,
    alignItems: 'center',
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 140,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  removePhoto: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  addPhotoTile: {
    width: 120,
    height: 140,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.overlay,
    gap: 6,
  },
  addPhotoText: {
    color: theme.mutedText,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  missingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  missingText: {
    color: theme.mutedText,
    textAlign: 'center',
  },
});
