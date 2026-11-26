import React, { useState } from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { ActionSheet } from './ActionSheet';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { PHOTO_ERROR_MESSAGES, pickPhoto, type PhotoSource } from '../utils/pickPhoto';
import { colors } from '../theme/colors';
import { iconSizes, typography } from '../theme/typography';

type PhotoStripProps = {
  photos: string[];
  onChange: (photos: string[]) => void;
  max: number;
};

// Evidence photos are shown full-screen by reviewers, so keep more detail.
const EVIDENCE_PHOTO_SIZE = 1024;
const TILE = 76;

// A row of photo tiles with an "add" tile (camera or gallery) until `max`
// photos; tap the × on a photo to remove it.
export function PhotoStrip({ photos, onChange, max }: PhotoStripProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(source: PhotoSource) {
    setSheetOpen(false);
    setError(null);
    const result = await pickPhoto(source, { square: false, maxSize: EVIDENCE_PHOTO_SIZE });
    if (result.status === 'picked') onChange([...photos, result.uri]);
    else if (result.status !== 'cancelled') setError(PHOTO_ERROR_MESSAGES[result.status]);
  }

  return (
    <View>
      <View style={styles.row}>
        {photos.map((uri, index) => (
          <View key={index} style={styles.tile}>
            <Image source={{ uri }} style={styles.image} />
            <PressableScale
              accessibilityLabel="Remove photo"
              haptic={false}
              style={styles.remove}
              onPress={() => onChange(photos.filter((_, i) => i !== index))}
            >
              <Icon name="close" size={iconSizes.sm} color={colors.white} />
            </PressableScale>
          </View>
        ))}
        {photos.length < max ? (
          <PressableScale accessibilityLabel="Add photo" style={[styles.tile, styles.addTile]} onPress={() => setSheetOpen(true)}>
            <Icon name="add" color={colors.accentText} />
          </PressableScale>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ActionSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Add a photo"
        options={[
          { label: 'Take a photo', icon: 'camera-outline', onPress: () => add('camera') },
          { label: 'Choose from gallery', icon: 'images-outline', onPress: () => add('library') },
          { label: 'Cancel', tone: 'muted', onPress: () => setSheetOpen(false) },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: TILE, height: TILE, borderRadius: 12, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  addTile: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { ...typography.hint, color: colors.warning, marginTop: 8 },
});
