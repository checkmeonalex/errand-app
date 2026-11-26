import React from 'react';
import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type FormFieldProps = TextInputProps & {
  label: string;
  // Shown in warning color under the input; replaces the hint when set.
  error?: string | null;
  hint?: string;
};

// A labelled text input with optional hint or error underneath.
// Any TextInput prop (keyboardType, secureTextEntry, ...) passes straight through.
export function FormField({ label, error, hint, style, ...inputProps }: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...inputProps}
      />
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginTop: 16 },
  label: { ...typography.sectionLabel, color: colors.textSecondary, marginBottom: 8 },
  input: {
    ...typography.input,
    color: colors.textPrimary,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputError: { borderColor: colors.warning },
  hint: { ...typography.hint, color: colors.textMuted, marginTop: 6 },
  error: { ...typography.hint, color: colors.warning, marginTop: 6 },
});
