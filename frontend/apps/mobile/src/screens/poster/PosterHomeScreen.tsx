import React from 'react';
import { ActivityIndicator, View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryCard } from '../../components/CategoryCard';
import { HeaderIconButton } from '../../components/HeaderIconButton';
import { Icon } from '../../components/Icon';
import { PressableScale } from '../../components/PressableScale';
import { ProfilePhotoButton } from '../../components/ProfilePhotoButton';
import { RotatingText } from '../../components/RotatingText';
import { TaskCard } from '../../components/TaskCard';
import { TextLink } from '../../components/TextLink';
import { CATEGORIES } from '../../constants/categories';
import { getPriceTag } from '../../constants/priceSuggestions';
import { TASK_EXAMPLES } from '../../constants/taskExamples';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TasksContext';
import { useChat } from '../../context/ChatContext';
import { useNotifications } from '../../context/NotificationsContext';
import { useGreeting } from '../../hooks/useGreeting';
import { getFirstName } from '../../utils/getFirstName';
import { completedCount } from '../../utils/taskStats';
import { openTask } from '../../navigation/openTask';
import { isActiveTask } from '../../utils/taskGroups';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

// Home shows a short preview; "See all" opens the full list.
const MAX_ACTIVE_ON_HOME = 3;

const HEADER_AVATAR_SIZE = 44;

// How far the "What do you need done?" card hangs below the navy header.
const CTA_OVERLAP = 34;

export function PosterHomeScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const greeting = useGreeting();
  const { user } = useAuth();
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { totalUnread } = useChat();
  const { unreadCount: unreadNotifications } = useNotifications();
  const activeTasks = tasks
    .filter(isActiveTask)
    .slice(0, MAX_ACTIVE_ON_HOME);
  // Name from sign-up; unknown after a mock log-in until the backend exists.
  const firstName = getFirstName(user?.full_name) ?? 'there';
  const tasksDone = completedCount(tasks);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent}>
      {/* Header lives inside the scroll view so the CTA card can overlap it
          without being clipped. */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        {/* Top left: your photo. Tap to change it or open Profile. */}
        <View style={styles.identity}>
          <ProfilePhotoButton size={HEADER_AVATAR_SIZE} onViewProfile={() => navigation.navigate('Profile')} />
          <View style={styles.greetingText}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.greetingName} numberOfLines={1}>
              Hi {firstName}
            </Text>
            {/* Count only, never money (spend lives in Payment history). */}
            {tasksDone > 0 ? (
              <Text style={styles.tasksDone}>
                {tasksDone} {tasksDone === 1 ? 'task' : 'tasks'} done
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.headerButtons}>
          <HeaderIconButton
            icon="notifications-outline"
            label="Notifications"
            badgeCount={unreadNotifications}
            onPress={() => navigation.navigate('NotificationsInbox')}
          />
          <HeaderIconButton
            icon="chatbubble-ellipses-outline"
            label="Messages"
            badgeCount={totalUnread}
            onPress={() => navigation.navigate('ChatList')}
          />
        </View>
      </View>

      <View style={styles.body}>
        <PressableScale
          accessibilityRole="button"
          style={styles.ctaCard}
          // Free-form request; the category cards below are the guided route.
          onPress={() => navigation.navigate('PostTask', { categoryId: 'other' })}
        >
          <View style={styles.ctaText}>
            <Text style={styles.ctaTitle}>What do you need done?</Text>
            <RotatingText items={TASK_EXAMPLES} style={styles.ctaSubtitle} />
          </View>
          <View style={styles.ctaArrow}>
            <Icon name="arrow-forward" color={colors.white} />
          </View>
        </PressableScale>

        <Text style={styles.sectionLabel}>Categories</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              label={category.label}
              icon={category.icon}
              priceTag={getPriceTag(category.id)}
              comingSoon={category.comingSoon}
              onPress={() => {
                if (category.comingSoon) {
                  // TODO: record the tap via @errand/api; tap counts are the
                  // demand signal for when to launch this category.
                  return;
                }
                // Categories with kinds (Academic, Household) ask which kind first.
                navigation.navigate(category.subcategories ? 'ChooseSubcategory' : 'PostTask', {
                  categoryId: category.id,
                });
              }}
            />
          ))}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabelInline}>Active tasks</Text>
          <TextLink label="See all" onPress={() => navigation.navigate('Tasks')} />
        </View>
        {tasksLoading ? (
          <ActivityIndicator color={colors.navy} style={styles.loading} />
        ) : activeTasks.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              No active tasks yet. Pick a category above to post one.
            </Text>
          </View>
        ) : (
          activeTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={() => openTask(navigation, task)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 32 },

  header: {
    backgroundColor: colors.navy,
    paddingHorizontal: 20,
    paddingBottom: 20 + CTA_OVERLAP,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: { ...typography.greeting, color: colors.navyMuted },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  greetingText: { flex: 1 },
  greetingName: { ...typography.title, color: colors.white, marginTop: 2 },
  tasksDone: { ...typography.greeting, color: colors.navyMuted, marginTop: 2 },
  headerButtons: { flexDirection: 'row', gap: 8 },

  body: { paddingHorizontal: 20, marginTop: -CTA_OVERLAP },
  ctaCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  ctaText: { flex: 1 },
  ctaTitle: { ...typography.heading, color: colors.textPrimary },
  ctaSubtitle: { ...typography.cardSubtitle, color: colors.textMuted, marginTop: 3 },
  ctaArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionLabel: {
    ...typography.sectionLabel,
    color: colors.textSecondary,
    marginTop: 28,
    marginBottom: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 12,
  },
  sectionLabelInline: { ...typography.sectionLabel, color: colors.textSecondary },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  emptyBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 14,
    padding: 18,
  },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  loading: { marginVertical: 18 },
});
