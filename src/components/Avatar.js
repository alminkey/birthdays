import React from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import { theme } from '../theme/colors';

function resolveUri({ uri, photoUris }) {
  if (typeof uri === 'string' && uri.trim().length > 0) {
    return uri;
  }
  if (Array.isArray(photoUris)) {
    return photoUris.find((item) => typeof item === 'string' && item.trim().length > 0) ?? null;
  }
  return null;
}

export default function Avatar({ uri, photoUris, name, size = 56 }) {
  const resolvedUri = resolveUri({ uri, photoUris });
  if (resolvedUri) {
    return (
      <Image
        source={{ uri: resolvedUri }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  const initials = (name ?? '?')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View
      style={[
        styles.placeholder,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={styles.initials}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  placeholder: {
    backgroundColor: theme.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  initials: {
    color: theme.accent,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
