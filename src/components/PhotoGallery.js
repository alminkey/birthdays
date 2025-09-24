import React from 'react';
import { View, ScrollView, Image, StyleSheet } from 'react-native';
import { theme } from '../theme/colors';

function toImageList(uris) {
  if (!Array.isArray(uris)) {
    return [];
  }
  return uris.filter((uri) => typeof uri === 'string' && uri.trim().length > 0);
}

export default function PhotoGallery({ uris = [] }) {
  const items = toImageList(uris);
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.strip}
      >
        {items.map((uri, index) => (
          <Image
            key={`${uri}-${index}`}
            source={{ uri }}
            style={styles.image}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    backgroundColor: theme.overlay,
    overflow: 'hidden',
  },
  strip: {
    padding: 12,
    gap: 12,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
});




