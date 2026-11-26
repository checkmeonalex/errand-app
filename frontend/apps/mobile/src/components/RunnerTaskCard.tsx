import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Task } from '@errand/types';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { getCategory, getSubcategory } from '../constants/categories';
import { formatNaira } from '../constants/priceSuggestions';
import { formatTime } from '../utils/formatTime';
import { payoutFor } from '../utils/runnerPayout';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type RunnerTaskCardProps = {
  task: Pick<Task, 'title' | 'category' | 'subcategory' | 'price' | 'payout' | 'extra_fields' | 'created_at'>;
  // My jobs shows where the job is ("Accepted", "Done"); the feed shows when it was posted.
  statusLabel?: string;
  onPress: () => void;
};

// One task for a runner: what it is, what they'd earn (the biggest text, as
// on every worker app), where and when.
export function RunnerTaskCard({ task, statusLabel, onPress }: RunnerTaskCardProps) {
  const category = getCategory(task.category);
  const subcategory = getSubcategory(task.category, task.subcategory);
  const where = task.extra_fields?.location;
  const needed = task.extra_fields?.deadline;
  const details = [where, needed ? `Needed ${String(needed).toLowerCase()}` : null].filter(Boolean).join(' · ');

  return (
    <PressableScale accessibilityRole="button" style={styles.card} onPress={onPress}>
      <View style={styles.top}>
        <View style={styles.iconBadge}>
          <Icon name={subcategory?.icon ?? category?.icon ?? 'clipboard-outline'} color={colors.accentText} />
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {task.title}
        </Text>
        {statusLabel ? (
          <View style={styles.pill}>
            <Text style={styles.pillText}>{statusLabel}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.earn}>You earn {formatNaira(payoutFor(task))}</Text>
      {details ? (
        <Text style={styles.meta} numberOfLines={1}>
          {details}
        </Text>
      ) : null}
      {statusLabel ? null : <Text style={styles.meta}>Posted {formatTime(task.created_at)}</Text>}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    backgroundColor: colors.background,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.cardTitle, color: colors.textPrimary, flex: 1 },
  pill: { backgroundColor: colors.accentLight, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  pillText: { ...typography.pill, color: colors.accentText },
  earn: { ...typography.heading, color: colors.textPrimary, marginTop: 10 },
  meta: { ...typography.cardSubtitle, color: colors.textMuted, marginTop: 4 },
});
