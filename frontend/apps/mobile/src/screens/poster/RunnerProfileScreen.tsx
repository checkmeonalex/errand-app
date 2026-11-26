import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Icon } from '../../components/Icon';
import { ReviewItem } from '../../components/ReviewItem';
import { SettingsPage } from '../../components/SettingsPage';
import { SettingsSection } from '../../components/SettingsSection';
import { StatTile } from '../../components/StatTile';
import { TextLink } from '../../components/TextLink';
import { getCategoryLabel } from '../../constants/categories';
import { RUNNER_LEVELS } from '../../constants/levels';
import { useFeedback } from '../../context/FeedbackContext';
import { useTasks } from '../../context/TasksContext';
import { reportKind } from '../../utils/feedbackRules';
import { formatRating } from '../../utils/formatRating';
import { getLevel } from '../../utils/getLevel';
import { colors } from '../../theme/colors';
import { iconSizes, typography } from '../../theme/typography';

const PHOTO_SIZE = 96;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// The runner who accepted a task: photo, verified, badges, rating, stats,
// level, what they do and reviews. Only what's actually known is shown: extra
// details appear once the backend sends them. Route params: { taskId }.
// TODO: runners.get(runnerId) and reviews.list(runnerId) via @errand/api.
export function RunnerProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { tasks } = useTasks();
  const { reviews } = useFeedback();
  const task = tasks.find((t) => t.id === route.params?.taskId);
  const runner = task?.runner;

  if (!task || !runner) {
    return (
      <SettingsPage title="Runner not found" subtitle="This runner's profile isn't available.">
        {null}
      </SettingsPage>
    );
  }

  // Reviews this device knows about: the ones you wrote.
  const runnerReviews = reviews.filter((review) => review.ratee_id === runner.id);
  const level = getLevel(RUNNER_LEVELS, runner.completed_count);
  const canReport = reportKind(task) !== null;

  return (
    <SettingsPage title="">
      <View style={styles.header}>
        <Avatar uri={runner.avatar_url} name={runner.first_name} size={PHOTO_SIZE} />
        <View style={styles.nameRow}>
          <Text style={styles.name}>{runner.first_name}</Text>
          <Icon name="shield-checkmark" size={iconSizes.sm} color={colors.accentText} />
          <Text style={styles.verified}>Verified</Text>
        </View>
        {runner.badges?.length ? (
          <View style={styles.badges}>
            {runner.badges.map((id) => (
              <Badge key={id} id={id} />
            ))}
          </View>
        ) : null}
        <View style={styles.ratingRow}>
          <Icon name="star" size={iconSizes.sm} color={colors.navy} />
          <Text style={styles.rating}>{formatRating(runner.rating)}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <StatTile value={String(runner.completed_count)} label="Tasks done" />
        {runner.on_time_rate !== undefined ? (
          <StatTile value={`${Math.round(runner.on_time_rate * 100)}%`} label="On time" />
        ) : null}
        {runner.member_since ? <StatTile value={memberSince(runner.member_since)} label="Member since" /> : null}
      </View>

      <Text style={styles.line}>
        Level: <Text style={styles.lineStrong}>{level.title}</Text>
      </Text>
      {runner.categories?.length ? (
        <Text style={styles.line}>Does: {runner.categories.map(getCategoryLabel).join(' · ')}</Text>
      ) : null}

      <SettingsSection title="Reviews">
        {runnerReviews.length ? (
          runnerReviews.map((review) => <ReviewItem key={review.id} review={review} author="You" />)
        ) : (
          <Text style={styles.empty}>No reviews yet.</Text>
        )}
      </SettingsSection>

      {canReport ? (
        <View style={styles.report}>
          <TextLink label="Report this runner" onPress={() => navigation.navigate('ReportProblem', { taskId: task.id })} />
        </View>
      ) : null}
    </SettingsPage>
  );
}

// "2026-03-14" → "Mar 2026"
function memberSince(iso: string): string {
  const date = new Date(iso);
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

const styles = StyleSheet.create({
  header: { alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12 },
  name: { ...typography.title, color: colors.textPrimary, marginRight: 6 },
  verified: { ...typography.pill, color: colors.accentText },
  badges: { flexDirection: 'row', gap: 6, marginTop: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  rating: { ...typography.cardTitle, color: colors.textPrimary },
  stats: { flexDirection: 'row', gap: 10, marginTop: 20 },
  line: { ...typography.body, color: colors.textMuted, marginTop: 14 },
  lineStrong: { ...typography.cardTitle, color: colors.navy },
  empty: { ...typography.body, color: colors.textMuted, padding: 14 },
  report: { alignItems: 'center', marginTop: 24 },
});
