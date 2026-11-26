import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Task } from '@errand/types';
import { getQuestionSet } from '../constants/categoryQuestions';
import type { Question } from '../constants/questionTypes';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type TaskAnswersProps = {
  task: Pick<Task, 'category' | 'subcategory' | 'extra_fields'>;
};

// "Task details": the poster's answers, one row per question, in the same
// order they were asked. Unanswered questions and file uploads are skipped.
export function TaskAnswers({ task }: TaskAnswersProps) {
  const questions = getQuestionSet(task.category, task.subcategory)?.questions ?? [];
  const rows = questions.flatMap((question) => {
    const value = formatAnswer(question, task.extra_fields?.[question.id]);
    return value ? [{ id: question.id, label: shortLabel(question.label), value }] : [];
  });

  if (rows.length === 0) return null;

  return (
    <View>
      {rows.map((row, index) => (
        <View key={row.id} style={[styles.row, index > 0 && styles.rowDivider]}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

function formatAnswer(question: Question, value: unknown): string | null {
  if (question.type === 'file' || value === undefined || value === '') return null;
  if (question.type === 'confirm') return value === true ? 'Yes' : null;
  if (Array.isArray(value)) return value.length ? value.join(', ') : null;
  if (question.type === 'number') return `${value} ${question.unit}`;
  return String(value);
}

// "How many pages? (at least 4)" → "How many pages?"
function shortLabel(label: string): string {
  return label.replace(/\s*\(.*?\)/g, '');
}

const styles = StyleSheet.create({
  row: { paddingVertical: 10, gap: 2 },
  rowDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  label: { ...typography.cardSubtitle, color: colors.textMuted },
  value: { ...typography.body, color: colors.textPrimary },
});
