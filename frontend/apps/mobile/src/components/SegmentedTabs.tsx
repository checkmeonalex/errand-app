import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type Tab<T extends string> = { value: T; label: string };

type SegmentedTabsProps<T extends string> = {
  tabs: Tab<T>[];
  value: T;
  onChange: (value: T) => void;
};

// A pill-shaped switch between a few views, e.g. Active / Past tasks.
export function SegmentedTabs<T extends string>({ tabs, value, onChange }: SegmentedTabsProps<T>) {
  return (
    <View style={styles.track} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <PressableScale
            key={tab.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.tab, selected && styles.tabSelected]}
            onPress={() => onChange(tab.value)}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{tab.label}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.accentLight,
    borderRadius: 999,
    padding: 4,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 999 },
  tabSelected: { backgroundColor: colors.background },
  label: { ...typography.cardTitle, color: colors.accentText },
  labelSelected: { color: colors.navy },
});
