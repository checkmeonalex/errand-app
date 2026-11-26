import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { LeaderboardBoard, LeaderboardEntry, LeaderboardWindow } from '@errand/types';
import { Icon } from '../../components/Icon';
import { LeaderboardRow } from '../../components/LeaderboardRow';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { colors } from '../../theme/colors';
import { iconSizes, typography } from '../../theme/typography';

const BOARDS: { value: LeaderboardBoard; label: string }[] = [
  { value: 'posters', label: 'Top Posters' },
  { value: 'runners', label: 'Top Runners' },
];

// Short labels so four fit in one switch; the line under it spells it out.
const WINDOWS: { value: LeaderboardWindow; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'all', label: 'All time' },
];

// When each board starts fresh, so everyone gets new chances to top it.
const RESETS: Record<LeaderboardWindow, string> = {
  week: 'This week. Resets every Monday.',
  month: 'This month. Resets on the 1st.',
  year: 'This year. Resets on 1 January.',
  all: 'All time. Never resets.',
};

// What each board ranks by (worked out on the backend; overview §9).
const RANKED_BY: Record<LeaderboardBoard, string> = {
  posters: 'Ranked by tasks completed, runner ratings, paying on time and no disputes.',
  runners: 'Ranked by tasks completed, rating and being on time.',
};

// The Ranks tab: Top Posters and Top Runners boards for this week, month,
// year or all time,
// with the user's own row pinned at the bottom. Rows come from
// useLeaderboard (backend leaderboard.get; empty until it exists).
export function RanksScreen() {
  const insets = useSafeAreaInsets();
  const [board, setBoard] = useState<LeaderboardBoard>('posters');
  const [period, setPeriod] = useState<LeaderboardWindow>('week');
  const { entries, me, isLoading, meMissingReason } = useLeaderboard(board, period);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>Ranks</Text>
      <View style={styles.tabs}>
        <SegmentedTabs tabs={BOARDS} value={board} onChange={setBoard} />
      </View>
      <View style={styles.tabs}>
        <SegmentedTabs tabs={WINDOWS} value={period} onChange={setPeriod} />
      </View>
      <Text style={styles.rankedBy}>
        {RANKED_BY[board]}
        {' '}
        {RESETS[period]}
      </Text>

      {isLoading ? (
        <ActivityIndicator color={colors.navy} style={styles.loading} />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(entry) => entry.user_id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <LeaderboardRow entry={item} isMe={item.user_id === me?.user_id} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Icon name="trophy-outline" size={iconSizes.lg} color={colors.accentText} />
              </View>
              <Text style={styles.emptyTitle}>No rankings yet</Text>
              <Text style={styles.emptyText}>
                The board fills up as students complete tasks. Get yours done to be on it.
              </Text>
            </View>
          }
        />
      )}

      <View style={[styles.mine, { paddingBottom: insets.bottom + 12 }]}>
        {me ? (
          <>
            <LeaderboardRow entry={me} isMe />
            <Text style={styles.nudge}>{nudgeText(me, entries)}</Text>
          </>
        ) : (
          <Text style={styles.nudge}>
            {meMissingReason === 'opted-out'
              ? "You're hidden from leaderboards. You can change this in Profile."
              : 'Become a runner to join this board.'}
          </Text>
        )}
      </View>
    </View>
  );
}

// "2 more tasks to pass #11" when the person above is known; otherwise a
// plain line about the user's own count.
function nudgeText(me: LeaderboardEntry, entries: LeaderboardEntry[]): string {
  const above = entries.find((entry) => entry.rank === me.rank - 1);
  if (me.rank > 1 && above) {
    const gap = Math.max(1, above.completed_count - me.completed_count + 1);
    return `${gap} more ${gap === 1 ? 'task' : 'tasks'} to pass #${above.rank}`;
  }
  if (me.rank === 1) return "You're number 1. Keep it up!";
  return me.completed_count > 0
    ? `${me.completed_count} completed ${me.completed_count === 1 ? 'task' : 'tasks'}. Your rank appears once boards are live.`
    : 'Complete a task to get on the board.';
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 },
  title: { ...typography.title, color: colors.textPrimary },
  tabs: { marginTop: 12 },
  rankedBy: { ...typography.hint, color: colors.textMuted, marginTop: 10 },
  loading: { marginTop: 32 },
  list: { paddingTop: 12, paddingBottom: 16, flexGrow: 1, gap: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { ...typography.heading, color: colors.textPrimary, marginTop: 14 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: 6 },
  mine: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  nudge: { ...typography.hint, color: colors.textMuted, textAlign: 'center', marginTop: 6 },
});
