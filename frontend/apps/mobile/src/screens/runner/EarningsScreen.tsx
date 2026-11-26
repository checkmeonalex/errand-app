import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../../components/Icon';
import { RunnerTaskCard } from '../../components/RunnerTaskCard';
import { SettingsPage } from '../../components/SettingsPage';
import { StatTile } from '../../components/StatTile';
import { formatNaira } from '../../constants/priceSuggestions';
import { useRunnerJobs } from '../../context/RunnerJobsContext';
import { runnerEarnings } from '../../utils/runnerEarnings';
import { colors } from '../../theme/colors';
import { iconSizes, typography } from '../../theme/typography';

// Opened from the earnings card on runner home: totals, then every paid or
// held job, newest first. Payouts go to the bank account the Taskly team
// added when the runner joined.
// TODO: runner.earnings + the payout account (masked) from @errand/api.
export function EarningsScreen() {
  const navigation = useNavigation<any>();
  const { jobs } = useRunnerJobs();
  const earnings = runnerEarnings(jobs);
  const paidOrHeld = jobs.filter((job) => job.status === 'completed' || job.status === 'disputed');

  return (
    <SettingsPage title="Earnings" subtitle="Paid to your bank account when you enter the handover code.">
      <View style={styles.stats}>
        <StatTile value={formatNaira(earnings.allTime)} label="All time" />
        <StatTile value={formatNaira(earnings.thisWeek)} label="This week" />
      </View>

      {paidOrHeld.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="wallet-outline" size={iconSizes.lg} color={colors.accentText} />
          <Text style={styles.emptyText}>Your pay for each task shows here once you finish it.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {paidOrHeld.map((job) => (
            <RunnerTaskCard
              key={job.id}
              task={job}
              statusLabel={job.status === 'completed' ? 'Paid' : 'Held for review'}
              onPress={() => navigation.navigate('RunnerJob', { taskId: job.id })}
            />
          ))}
        </View>
      )}
    </SettingsPage>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 10, marginTop: 20 },
  list: { marginTop: 20 },
  empty: { alignItems: 'center', marginTop: 48, gap: 10 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
