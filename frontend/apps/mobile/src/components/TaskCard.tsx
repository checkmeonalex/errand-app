import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import type { Task, TaskStatus } from '@errand/types';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { getCategory } from '../constants/categories';
import { formatNaira } from '../constants/priceSuggestions';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type TaskCardProps = {
  task: Pick<Task, 'title' | 'status' | 'category' | 'price'>;
  onPress?: () => void;
};

// Maps a task status to a short, human label for the pill.
// Keep this map here — it's the one place status copy is decided.
const STATUS_LABEL: Record<TaskStatus, string> = {
  'pending-payment': 'Awaiting payment',
  posted: 'Open',
  accepted: 'Accepted',
  'in-progress': 'In progress',
  completed: 'Completed',
  closed: 'Closed',
  disputed: 'Disputed',
};

// One task in a list: category icon, title, "Category · ₦price", status.
export function TaskCard({ task, onPress }: TaskCardProps) {
  const category = getCategory(task.category);

  return (
    <PressableScale accessibilityRole="button" style={styles.card} onPress={onPress}>
      <View style={styles.iconBadge}>
        <Icon name={category?.icon ?? 'clipboard-outline'} color={colors.accentText} />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {task.title}
        </Text>
        <Text style={styles.subtitle}>
          {category?.label ?? 'Task'} · {formatNaira(task.price)}
        </Text>
      </View>
      <View style={styles.pill}>
        <Text style={styles.pillText}>{STATUS_LABEL[task.status]}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    backgroundColor: colors.background,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { flex: 1 },
  title: { ...typography.cardTitle, color: colors.textPrimary },
  subtitle: { ...typography.cardSubtitle, color: colors.textMuted, marginTop: 2 },
  pill: {
    backgroundColor: colors.accentLight,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  pillText: { ...typography.pill, color: colors.accentText },
});
