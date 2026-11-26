import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Task } from '@errand/types';
import { Icon } from './Icon';
import { getCategory, getSubcategory } from '../constants/categories';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type CheckoutSummaryProps = {
  task: Pick<Task, 'title' | 'category' | 'subcategory' | 'extra_fields'>;
};

// What's being paid for: icon, title, category · where, and when it's needed
// / how long it stays live. Answers come from the task's extra_fields.
export function CheckoutSummary({ task }: CheckoutSummaryProps) {
  const category = getCategory(task.category);
  const subcategory = getSubcategory(task.category, task.subcategory);
  const answers = task.extra_fields ?? {};

  const where = typeof answers.location === 'string' && answers.location.trim() ? answers.location.trim() : null;
  const when = typeof answers.deadline === 'string' ? answers.deadline : null;
  const live = typeof answers.acceptWindow === 'string' ? answers.acceptWindow : null;

  return (
    <View style={styles.card}>
      <View style={styles.iconBadge}>
        <Icon name={subcategory?.icon ?? category?.icon ?? 'clipboard-outline'} color={colors.accentText} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={2}>
          {task.title}
        </Text>
        <Text style={styles.line} numberOfLines={1}>
          {subcategory?.label ?? category?.label ?? 'Task'}
          {where ? ` · ${where}` : ''}
        </Text>
        {when || live ? (
          <Text style={styles.line}>
            {when ? `Needed: ${when}` : ''}
            {when && live ? ' · ' : ''}
            {live ? `live for ${live}` : ''}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  title: { ...typography.cardTitle, color: colors.textPrimary },
  line: { ...typography.cardSubtitle, color: colors.textMuted, marginTop: 3 },
});
