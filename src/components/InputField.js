import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { theme } from '../theme/colors';

export default function InputField({ label, value, onChangeText, placeholder, multiline = false, rightAdornment }) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, multiline && styles.multiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.mutedText}
          multiline={multiline}
        />
        {rightAdornment ? <View style={styles.adornment}>{rightAdornment}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputContainer: {
    backgroundColor: theme.overlay,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  input: {
    color: theme.text,
    fontSize: 16,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  adornment: {
    position: 'absolute',
    right: 20,
    top: 16,
  },
});
