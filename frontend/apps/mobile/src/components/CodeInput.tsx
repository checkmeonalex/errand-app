import React, { useRef } from 'react';
import { Pressable, Text, TextInput, View, StyleSheet, type TextInputInstance } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type CodeInputProps = {
  length: number;
  value: string;
  onChange: (code: string) => void;
  // Called once every box is filled (e.g. to submit automatically).
  onComplete?: (code: string) => void;
  hasError?: boolean;
};

// A row of boxes for a one-time code. One hidden text field does the typing,
// so pasting a whole code and the phone's "fill code from email/SMS" both work.
export function CodeInput({ length, value, onChange, onComplete, hasError }: CodeInputProps) {
  const inputRef = useRef<TextInputInstance>(null);

  function handleChange(text: string) {
    const digits = text.replace(/\D/g, '').slice(0, length);
    onChange(digits);
    if (digits.length === length) onComplete?.(digits);
  }

  return (
    <Pressable accessibilityLabel="Code" onPress={() => inputRef.current?.focus()}>
      <View style={styles.row}>
        {Array.from({ length }, (_, index) => {
          const isActive = index === value.length;
          return (
            <View
              key={index}
              style={[styles.box, isActive && styles.boxActive, hasError && styles.boxError]}
            >
              <Text style={styles.digit}>{value[index] ?? ''}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        autoFocus
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  box: {
    width: 46,
    height: 54,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: { borderColor: colors.navy },
  boxError: { borderColor: colors.warning },
  digit: { ...typography.title, color: colors.textPrimary },
  // Kept on screen (not display: none) so the keyboard and autofill work.
  hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1 },
});
