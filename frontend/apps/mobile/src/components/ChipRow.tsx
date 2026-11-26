import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type ChipRowProps = {
  options: string[];
  isSelected: (option: string) => boolean;
  onToggle: (option: string) => void;
};

// A wrapping row of tappable pills. Used for single choice (one selected)
// and multi choice (several selected); the caller decides via isSelected.
export function ChipRow({ options, isSelected, onToggle }: ChipRowProps) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selected = isSelected(option);
        return (
          <PressableScale
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => onToggle(option)}
          >
            <Text style={[styles.text, selected && styles.textSelected]}>{option}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 14,
    backgroundColor: colors.background,
  },
  chipSelected: { backgroundColor: colors.navy, borderColor: colors.navy },
  text: { ...typography.body, color: colors.textPrimary },
  textSelected: { color: colors.white },
});
