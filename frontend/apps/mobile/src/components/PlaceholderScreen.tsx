import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type PlaceholderScreenProps = {
  title: string;
  note?: string;
};

// Temporary stand-in so navigation works end-to-end while each real
// screen is built one at a time. Delete the import of this component
// from a screen file once that screen has real content.
export function PlaceholderScreen({ title, note }: PlaceholderScreenProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { ...typography.heading, color: colors.textPrimary },
  note: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
});
