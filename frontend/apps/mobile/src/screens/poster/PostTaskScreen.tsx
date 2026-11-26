import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { QuestionField } from '../../components/QuestionField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Icon } from '../../components/Icon';
import { getCategory, getSubcategory } from '../../constants/categories';
import { getQuestionSet, getVisibleQuestions } from '../../constants/categoryQuestions';
import type { Answers, AnswerValue, Question } from '../../constants/questionTypes';
import { getMinimumPrice, getPriceHintForAnswers } from '../../constants/priceSuggestions';
import { getAnswerError, getPriceError } from '../../utils/taskFormValidation';
import { useTasks } from '../../context/TasksContext';
import { useSettings } from '../../context/SettingsContext';
import { colors } from '../../theme/colors';
import { iconSizes, typography } from '../../theme/typography';

// One screen for every category: it asks the questions listed for the
// category (or subcategory) in categoryQuestions.ts, then price, then saves the
// task unpaid and hands over to CheckoutScreen (it goes live once paid).
// Route params: { categoryId, subcategoryId? }.
export function PostTaskScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const categoryId: string | undefined = route.params?.categoryId;
  const subcategoryId: string | undefined = route.params?.subcategoryId;

  const category = getCategory(categoryId);
  const subcategory = getSubcategory(categoryId, subcategoryId);
  const questionSet = getQuestionSet(categoryId, subcategoryId);
  const { addTask } = useTasks();

  const { settings } = useSettings();
  // Start "Where?" from the user's default meeting spot (Settings → Preferences).
  const [answers, setAnswers] = useState<Answers>(() =>
    settings.defaultMeetingSpot ? { location: settings.defaultMeetingSpot } : {},
  );
  const [price, setPrice] = useState('');
  // Errors only show after the first "Post task" tap, not while typing.
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!category || !questionSet) {
    return (
      <View style={styles.centered}>
        <Text style={styles.centeredText}>
          Something went wrong loading this category. Go back and pick one again.
        </Text>
      </View>
    );
  }

  const visibleQuestions = getVisibleQuestions(questionSet, answers);
  const blockingQuestion = visibleQuestions.find(
    (q) => q.type === 'choice' && q.blockIf && answers[q.id] === q.blockIf.equals,
  );
  const minimumPrice = getMinimumPrice(categoryId, subcategoryId, visibleQuestions, answers);
  const priceError = getPriceError(price, minimumPrice);
  const errorFor = (q: Question) => getAnswerError(q, answers[q.id]);
  const hasMissingAnswers = visibleQuestions.some((q) => errorFor(q));

  function setAnswer(id: string, value: AnswerValue) {
    setAnswers((current) => ({ ...current, [id]: value }));
  }

  async function handleSubmit() {
    setShowErrors(true);
    if (hasMissingAnswers || priceError || blockingQuestion) return;

    // Only send answers to questions that are actually showing.
    const extraFields: Answers = {};
    for (const q of visibleQuestions) extraFields[q.id] = answers[q.id];

    setLoading(true);
    setSubmitError(null);
    try {
      const task = await addTask({
        title: questionSet!.title(answers),
        // The free-text answers runners read first.
        description: [answers.description, answers.content, answers.extraInfo]
          .filter((part): part is string => typeof part === 'string' && part.trim() !== '')
          .join('\n\n'),
        category: category!.id,
        subcategory: subcategoryId,
        price: Number(price),
        extra_fields: extraFields,
      });
      // Not live yet: the poster pays first. replace() so Back from payment
      // doesn't return to this filled form and post it twice.
      navigation.replace('Checkout', { taskId: task.id });
    } catch {
      setSubmitError("Couldn't post your task. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.pill}>
        <Icon
          name={subcategory?.icon ?? category.icon}
          size={iconSizes.sm}
          color={colors.accentText}
        />
        <Text style={styles.pillText}>
          {category.label}
          {subcategory ? ` · ${subcategory.label}` : ''}
        </Text>
      </View>
      <Text style={styles.title}>Tell us what you need</Text>
      <Text style={styles.subtitle}>Clear answers help runners decide quickly.</Text>

      {questionSet.notice ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>{questionSet.notice}</Text>
        </View>
      ) : null}

      {visibleQuestions.map((question) => (
        <QuestionField
          key={question.id}
          question={question}
          value={answers[question.id]}
          onChange={(value) => setAnswer(question.id, value)}
          error={showErrors ? errorFor(question) : null}
        />
      ))}

      <View style={styles.priceSection}>
        <Text style={styles.priceLabel}>Your price</Text>
        <View style={[styles.priceRow, showErrors && priceError ? styles.priceRowError : null]}>
          <Text style={styles.nairaSign}>₦</Text>
          <TextInput
            style={styles.priceInput}
            placeholder="Amount"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            value={price}
            onChangeText={(value) => setPrice(value.replace(/[^0-9]/g, ''))}
          />
        </View>
        {showErrors && priceError ? (
          <Text style={styles.errorText}>{priceError}</Text>
        ) : (
          <Text style={styles.hintText}>{getPriceHintForAnswers(categoryId, subcategoryId, visibleQuestions, answers)}</Text>
        )}
      </View>

      {showErrors && (hasMissingAnswers || blockingQuestion) ? (
        <Text style={styles.summaryError}>
          {blockingQuestion
            ? "This task can't be posted yet. See the note above."
            : 'Answer the questions marked in orange to continue.'}
        </Text>
      ) : null}
      {submitError ? <Text style={styles.summaryError}>{submitError}</Text> : null}

      <PrimaryButton label="Continue to payment" onPress={handleSubmit} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 48 },

  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentLight,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pillText: { ...typography.pill, color: colors.accentText },
  title: { ...typography.title, color: colors.textPrimary, marginTop: 14 },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: 4 },

  notice: {
    backgroundColor: colors.accentLight,
    borderRadius: 12,
    padding: 14,
    marginTop: 18,
  },
  noticeText: { ...typography.body, color: colors.accentText },

  priceSection: {
    marginTop: 28,
    paddingTop: 22,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  priceLabel: { ...typography.sectionLabel, color: colors.textPrimary, marginBottom: 10 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  priceRowError: { borderColor: colors.warning },
  nairaSign: { ...typography.heading, color: colors.textPrimary, marginRight: 6 },
  priceInput: { flex: 1, paddingVertical: 12, ...typography.heading, color: colors.textPrimary },
  hintText: { ...typography.hint, color: colors.textMuted, marginTop: 6 },
  errorText: { ...typography.hint, color: colors.warning, marginTop: 6 },
  summaryError: { ...typography.hint, color: colors.warning, marginTop: 18 },

  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  centeredText: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: 8 },
});
