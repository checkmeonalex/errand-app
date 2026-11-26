import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Avatar } from '../../components/Avatar';
import { BottomActionBar } from '../../components/BottomActionBar';
import { ChipRow } from '../../components/ChipRow';
import { SettingsPage } from '../../components/SettingsPage';
import { StarRating, type Stars } from '../../components/StarRating';
import { TextLink } from '../../components/TextLink';
import {
  LOW_RATING_MAX,
  NEGATIVE_REVIEW_TAGS,
  POSITIVE_REVIEW_TAGS,
  REVIEW_COMMENT_MAX,
} from '../../constants/reviewTags';
import { useFeedback } from '../../context/FeedbackContext';
import { useTasks } from '../../context/TasksContext';
import { canRate } from '../../utils/feedbackRules';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const AVATAR_SIZE = 72;
const STAR_SIZE = 36;

// "How was {runner}?" after a task is done: stars (required), quick tags that
// match the stars, an optional comment. One rating per task, final once sent.
// Route params: { taskId }.
export function RateRunnerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { tasks } = useTasks();
  const { addReview, reviewFor } = useFeedback();
  const task = tasks.find((t) => t.id === route.params?.taskId);

  const [stars, setStars] = useState<Stars | 0>(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!task?.runner || !canRate(task) || reviewFor(task.id)) {
    return (
      <SettingsPage
        title="Rating not available"
        subtitle={
          task && reviewFor(task.id)
            ? "You've already rated this task. Thanks!"
            : 'Ratings open once a task is done, for 7 days.'
        }
      >
        {null}
      </SettingsPage>
    );
  }

  const runner = task.runner;
  const isLow = stars > 0 && stars <= LOW_RATING_MAX;
  const tagOptions = isLow ? NEGATIVE_REVIEW_TAGS : POSITIVE_REVIEW_TAGS;

  function pickStars(next: Stars) {
    // Switching between good and bad clears tags from the other set.
    if ((next <= LOW_RATING_MAX) !== isLow) setTags([]);
    setStars(next);
  }

  async function submit() {
    if (!stars) return;
    setSending(true);
    setError(null);
    try {
      await addReview({
        task_id: task!.id,
        ratee_id: runner.id,
        stars,
        tags,
        comment: comment.trim() || undefined,
      });
      navigation.goBack();
    } catch {
      setError("Couldn't send your rating. Please try again.");
      setSending(false);
    }
  }

  return (
    <SettingsPage
      title=""
      footer={
        <BottomActionBar
          primary={{ label: 'Submit', onPress: submit, loading: sending, disabled: !stars }}
          secondary={{ label: 'Rate later', onPress: () => navigation.goBack() }}
        />
      }
    >
      <View style={styles.header}>
        <Avatar uri={runner.avatar_url} name={runner.first_name} size={AVATAR_SIZE} />
        <Text style={styles.title}>How was {runner.first_name}?</Text>
        <Text style={styles.task}>{task.title}</Text>
        <View style={styles.stars}>
          <StarRating value={stars} onChange={pickStars} size={STAR_SIZE} />
        </View>
      </View>

      {stars ? (
        <>
          <Text style={styles.label}>{isLow ? 'What went wrong?' : 'What stood out?'}</Text>
          <ChipRow
            options={tagOptions}
            isSelected={(tag) => tags.includes(tag)}
            onToggle={(tag) =>
              setTags((current) => (current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]))
            }
          />

          <Text style={styles.label}>Anything else? (optional)</Text>
          <TextInput
            style={styles.comment}
            multiline
            maxLength={REVIEW_COMMENT_MAX}
            placeholder={`Say more about ${runner.first_name}…`}
            placeholderTextColor={colors.textMuted}
            value={comment}
            onChangeText={setComment}
          />
          <Text style={styles.count}>
            {comment.length}/{REVIEW_COMMENT_MAX}
          </Text>

          {isLow ? (
            <View style={styles.reportLink}>
              <TextLink
                label="Had a real problem? Report it"
                onPress={() => navigation.navigate('ReportProblem', { taskId: task.id })}
              />
            </View>
          ) : null}
        </>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </SettingsPage>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginTop: 8 },
  title: { ...typography.title, color: colors.textPrimary, marginTop: 14 },
  task: { ...typography.body, color: colors.textMuted, marginTop: 4 },
  stars: { marginTop: 18 },
  label: { ...typography.sectionLabel, color: colors.textSecondary, marginTop: 24, marginBottom: 10 },
  comment: {
    ...typography.input,
    color: colors.textPrimary,
    minHeight: 90,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
  },
  count: { ...typography.hint, color: colors.textMuted, alignSelf: 'flex-end', marginTop: 4 },
  reportLink: { alignItems: 'center', marginTop: 16 },
  error: { ...typography.hint, color: colors.warning, marginTop: 16 },
});
