import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme/colors';

export default function SearchInput({ value, onChangeText, placeholder = 'Search' }) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="magnify" size={22} color={theme.mutedText} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.mutedText}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.overlay,
    paddingHorizontal: 18,
    borderRadius: 18,
    height: 52,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  input: {
    flex: 1,
    color: theme.text,
    fontSize: 16,
  },
});
