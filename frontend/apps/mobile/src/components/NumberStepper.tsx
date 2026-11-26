import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type NumberStepperProps = {
  // Kept as a string so the field can be empty before the user answers.
  value: string;
  min: number;
  unit: string;
  onChange: (value: string) => void;
  hasError?: boolean;
};

// − [ 3 ] +  pages. Tap the buttons or type a number directly.
export function NumberStepper({ value, min, unit, onChange, hasError }: NumberStepperProps) {
  const current = value === '' ? null : Number(value);
  const canDecrease = current !== null && current > min;

  function step(delta: number) {
    // From empty, the first tap of + lands on `min`.
    const next = Math.max(min, (current ?? min - delta) + delta);
    onChange(String(next));
  }

  return (
    <View style={styles.row}>
      <View style={[styles.stepper, hasError && styles.stepperError]}>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`Fewer ${unit}`}
          style={[styles.button, !canDecrease && styles.buttonDisabled]}
          disabled={!canDecrease}
          onPress={() => step(-1)}
        >
          <Icon name="remove" />
        </PressableScale>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={(next) => onChange(next.replace(/[^0-9]/g, ''))}
        />
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`More ${unit}`}
          style={styles.button}
          onPress={() => step(1)}
        >
          <Icon name="add" />
        </PressableScale>
      </View>
      <Text style={styles.unit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 4,
  },
  stepperError: { borderColor: colors.warning },
  button: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  input: {
    ...typography.cardTitle,
    color: colors.textPrimary,
    minWidth: 52,
    textAlign: 'center',
    paddingVertical: 8,
  },
  unit: { ...typography.body, color: colors.textMuted },
});
