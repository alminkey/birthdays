import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
  Image,
  Alert,
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

const CATEGORIES = [
  { label: 'Family', value: 'family' },
  { label: 'Friends', value: 'friends' },
  { label: 'Work', value: 'work' },
  { label: 'Other', value: 'other' },
];

const MAX_PHOTOS = 10;

function uniqueUris(list) {
  return Array.from(new Set(list.filter((uri) => typeof uri === 'string' && uri.trim().length > 0)));
}

export default function AddBirthdayScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const editingId = route.params?.id;
  const isEditing = Boolean(editingId);
  const { birthdays, addBirthday, updateBirthday } = useCelebrations();

  const existing = useMemo(
    () => birthdays.find((item) => item.id === editingId),
    [birthdays, editingId],
  );

  const hydrated = useRef(false);

  useEffect(() => {
    hydrated.current = false;
  }, [editingId]);

  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date());
  const [showIosPicker, setShowIosPicker] = useState(false);
  const [giftIdea, setGiftIdea] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('other');
  const [notifyOffsets, setNotifyOffsets] = useState([...DEFAULT_NOTIFY_OFFSETS]);
  const [photoUris, setPhotoUris] = useState([]);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (isEditing && existing && !hydrated.current) {
      setName(existing.name ?? '');
      setDate(dayjs(existing.date, 'YYYY-MM-DD').toDate());
      setGiftIdea(existing.giftIdea ?? '');
      setNotes(existing.notes ?? '');
      setCategory(existing.category ?? 'other');
      setNotifyOffsets(existing.notifyOffsets ?? DEFAULT_NOTIFY_OFFSETS);
      setPhotoUris(uniqueUris(existing.photoUris ?? []));
      setPhone(existing.contact?.phone ?? '');
      setEmail(existing.contact?.email ?? '');
      hydrated.current = true;
    }
  }, [isEditing, existing]);

  const formattedDate = dayjs(date).format('MMMM D, YYYY');

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
      setShowIosPicker(true);
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
      aspect: [4, 5],
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
      aspect: [4, 5],
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
    if (!name.trim()) {
      Alert.alert('Name required', 'Please add a name before saving.');
      return;
    }

    const payload = {
      name: name.trim(),
      date: dayjs(date).format('YYYY-MM-DD'),
      giftIdea,
      notes,
      category,
      notifyOffsets: [...notifyOffsets],
      photoUris: uniqueUris(photoUris),
      contact: {
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      },
    };

    if (isEditing) {
      if (!existing) {
        Alert.alert('Not found', 'This birthday could not be loaded for editing.');
        return;
      }
      await updateBirthday(existing.id, payload);
    } else {
      await addBirthday(payload);
    }
    navigation.goBack();
  };

  if (isEditing && !existing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.missingContainer}>
          <Text style={styles.missingText}>This birthday is no longer available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const canSubmit = Boolean(name.trim());

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <Text style={styles.heading}>{isEditing ? 'Edit birthday' : 'Add birthday'}</Text>
          <InputField label="Name" value={name} onChangeText={setName} placeholder="Full name" />
          <View style={styles.dateRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Birthday</Text>
              <Text style={styles.dateValue}>{formattedDate}</Text>
            </View>
            <Pressable style={styles.dateButton} onPress={handlePickDate}>
              <Text style={styles.dateButtonText}>Select date</Text>
            </Pressable>
          </View>
          {showIosPicker ? (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={date}
                mode="date"
                display="inline"
                onChange={(_, selectedDate) => {
                  if (selectedDate) {
                    setDate(selectedDate);
                  }
                  setShowIosPicker(false);
                }}
              />
            </View>
          ) : null}
          <InputField label="Gift idea" value={giftIdea} onChangeText={setGiftIdea} placeholder="Add a gift idea" />
          <InputField
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Add personal notes"
            multiline
          />
          <Text style={styles.label}>Category</Text>
          <View style={styles.chipsRow}>
            {CATEGORIES.map((item) => (
              <FilterChip
                key={item.value}
                label={item.label}
                active={category === item.value}
                onPress={() => setCategory(item.value)}
              />
            ))}
          </View>
          <NotifyOffsetSelector values={notifyOffsets} onChange={setNotifyOffsets} />
          <Text style={styles.label}>Contact</Text>
          <InputField label="Phone" value={phone} onChangeText={setPhone} placeholder="Phone number" />
          <InputField label="Email" value={email} onChangeText={setEmail} placeholder="Email address" />
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
          label={isEditing ? 'Save changes' : 'Save birthday'}
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  dateValue: {
    color: theme.text,
    fontWeight: '600',
  },
  dateButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  dateButtonText: {
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
  pickerContainer: {
    backgroundColor: theme.overlay,
    borderRadius: 16,
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
