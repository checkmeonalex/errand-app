import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type SettingsSectionProps = {
  title?: string;
  children: React.ReactNode;
};

// A titled group of settings rows in one rounded card, with thin dividers
// between rows.
export function SettingsSection({ title, children }: SettingsSectionProps) {
  const rows = React.Children.toArray(children).filter(Boolean);

  return (
    <View style={styles.section}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.card}>
        {rows.map((row, index) => (
          <View key={index} style={index > 0 ? styles.divider : undefined}>
            {row}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  title: { ...typography.sectionLabel, color: colors.textSecondary, marginBottom: 8 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    overflow: 'hidden',
  },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
});
