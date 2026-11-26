import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { ChipRow } from './ChipRow';
import { NumberStepper } from './NumberStepper';
import { CheckboxRow } from './CheckboxRow';
import { FileUploadPlaceholder } from './FileUploadPlaceholder';
import type { AnswerValue, Question } from '../constants/questionTypes';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type QuestionFieldProps = {
  question: Question;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  error?: string | null;
};

// One question from categoryQuestions.ts: its label, the right input for its
// type, and its error. Each input type lives in its own component file.
export function QuestionField({ question, value, onChange, error }: QuestionFieldProps) {
  // A confirm question's label is the checkbox text itself.
  const showLabel = question.type !== 'confirm';

  return (
    <View style={styles.block}>
      {showLabel ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{question.label}</Text>
          {question.optional || question.type === 'file' ? (
            <Text style={styles.optional}>Optional</Text>
          ) : null}
        </View>
      ) : null}
      {renderInput(question, value, onChange, !!error)}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function renderInput(
  question: Question,
  value: AnswerValue,
  onChange: (value: AnswerValue) => void,
  hasError: boolean,
) {
  switch (question.type) {
    case 'choice': {
      const blocked = question.blockIf && value === question.blockIf.equals;
      return (
        <>
          <ChipRow
            options={question.options}
            isSelected={(option) => value === option}
            onToggle={onChange}
          />
          {blocked ? (
            <View style={styles.blockedBox}>
              <Text style={styles.blockedText}>{question.blockIf!.message}</Text>
            </View>
          ) : null}
        </>
      );
    }

    case 'multi': {
      const selected = Array.isArray(value) ? value : [];
      return (
        <ChipRow
          options={question.options}
          isSelected={(option) => selected.includes(option)}
          onToggle={(option) =>
            onChange(
              selected.includes(option)
                ? selected.filter((item) => item !== option)
                : [...selected, option],
            )
          }
        />
      );
    }

    case 'number':
      return (
        <NumberStepper
          value={typeof value === 'string' ? value : ''}
          min={question.min ?? 1}
          unit={question.unit}
          onChange={onChange}
          hasError={hasError}
        />
      );

    case 'text':
      return (
        <TextInput
          style={[styles.input, question.multiline && styles.multiline, hasError && styles.inputError]}
          placeholder={question.placeholder}
          placeholderTextColor={colors.textMuted}
          multiline={question.multiline}
          value={typeof value === 'string' ? value : ''}
          onChangeText={onChange}
        />
      );

    case 'file':
      return <FileUploadPlaceholder />;

    case 'confirm':
      return (
        <>
          <CheckboxRow
            label={question.label}
            checked={value === true}
            onChange={onChange}
            hasError={hasError}
          />
          {question.uncheckedNote && value !== true ? (
            <View style={styles.reminderBox}>
              <Text style={styles.reminderText}>{question.uncheckedNote}</Text>
            </View>
          ) : null}
        </>
      );
  }
}

const styles = StyleSheet.create({
  block: { marginTop: 22 },
  labelRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 10 },
  label: { ...typography.sectionLabel, color: colors.textPrimary, flexShrink: 1 },
  optional: { ...typography.hint, color: colors.textMuted },
  error: { ...typography.hint, color: colors.warning, marginTop: 6 },

  input: {
    ...typography.input,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  inputError: { borderColor: colors.warning },

  blockedBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: 12,
    padding: 12,
  },
  blockedText: { ...typography.hint, color: colors.warning },

  reminderBox: {
    marginTop: 10,
    backgroundColor: colors.accentLight,
    borderRadius: 12,
    padding: 12,
  },
  reminderText: { ...typography.hint, color: colors.accentText },
});
