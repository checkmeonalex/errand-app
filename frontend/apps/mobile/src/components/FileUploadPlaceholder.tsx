import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

// Stands in for a file picker until the backend has file storage.
// TODO: pick a file and upload it to private storage via @errand/api. It must
// be visible only to the selected runner (PROJECT_OVERVIEW.md §6).
export function FileUploadPlaceholder() {
  return (
    <View style={styles.box}>
      <Icon name="attach-outline" color={colors.textMuted} />
      <Text style={styles.text}>File upload is coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
  },
  text: { ...typography.body, color: colors.textMuted },
});
