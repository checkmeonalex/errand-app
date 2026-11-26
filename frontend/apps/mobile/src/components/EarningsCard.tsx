import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { formatNaira } from '../constants/priceSuggestions';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type EarningsCardProps = {
  allTime: number;
  thisWeek: number;
  tasksThisWeek: number;
  onPress: () => void;
};

// The runner's earnings at the top of their home (no Earnings tab, to keep
// the tab bar to four). Tap for the full list.
export function EarningsCard({ allTime, thisWeek, tasksThisWeek, onPress }: EarningsCardProps) {
  return (
    <PressableScale accessibilityRole="button" accessibilityLabel="Open earnings" style={styles.card} onPress={onPress}>
      <Text style={styles.label}>Earned all time</Text>
      <Text style={styles.amount}>{formatNaira(allTime)}</Text>
      <View style={styles.row}>
        <Text style={styles.week}>
          {allTime === 0
            ? 'Your pay shows here after your first task'
            : `This week ${formatNaira(thisWeek)} · ${tasksThisWeek} ${tasksThisWeek === 1 ? 'task' : 'tasks'}`}
        </Text>
        <Icon name="chevron-forward" color={colors.navyMuted} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.headerButton, borderRadius: 16, padding: 16, marginTop: 18 },
  label: { ...typography.greeting, color: colors.navyMuted },
  amount: { ...typography.title, color: colors.white, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  week: { ...typography.cardSubtitle, color: colors.navyMuted, flex: 1 },
});
