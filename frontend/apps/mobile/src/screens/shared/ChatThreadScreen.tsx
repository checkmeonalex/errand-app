import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatSafetyBanner } from '../../components/ChatSafetyBanner';
import { Avatar } from '../../components/Avatar';
import { ChipRow } from '../../components/ChipRow';
import { HandoverCodeButton } from '../../components/HandoverCodeButton';
import { Icon } from '../../components/Icon';
import { MessageBubble } from '../../components/MessageBubble';
import { MessageComposer } from '../../components/MessageComposer';
import { PressableScale } from '../../components/PressableScale';
import { LOCAL_USER_ID } from '../../constants/localUser';
import { QUICK_REPLIES } from '../../constants/quickReplies';
import { useChat } from '../../context/ChatContext';
import { useTasks } from '../../context/TasksContext';
import { useFeedback } from '../../context/FeedbackContext';
import { reportKind } from '../../utils/feedbackRules';
import { canSendMessages } from '../../utils/chatRules';
import { formatRating } from '../../utils/formatRating';
import { colors } from '../../theme/colors';
import { iconSizes, typography } from '../../theme/typography';

// One task's chat. Header (who + which task; tap for Task detail), safety
// banner, messages, the handover code button (once in progress), quick
// replies and the text box. Read-only once the task
// is done or refunded. Route params: { taskId, viewer? }. viewer 'runner'
// (from a runner's job) shows the poster instead, and never the handover code.
export function ChatThreadScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { tasks, isLoading } = useTasks();
  const { messagesFor, sendMessage, markRead, simulateRunnerReply } = useChat();
  const { reportFor } = useFeedback();
  const listRef = useRef<FlatList>(null);

  const taskId: string | undefined = route.params?.taskId;
  const asRunner = route.params?.viewer === 'runner';
  const task = tasks.find((t) => t.id === taskId);
  const messages = taskId ? messagesFor(taskId) : [];

  // Opening the chat (and every new message while it's open) counts as read.
  useEffect(() => {
    if (taskId) markRead(taskId);
  }, [taskId, messages.length]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.navy} />
      </View>
    );
  }

  if (!task || !task.runner) {
    return (
      <View style={styles.centered}>
        <Text style={styles.centeredText}>
          This chat isn't available. Chats open when a runner accepts your task.
        </Text>
      </View>
    );
  }

  const runner = task.runner;
  // The other person in this chat.
  const other = asRunner
    ? { id: task.creator_id, first_name: task.poster?.first_name ?? 'The poster', avatar_url: task.poster?.avatar_url }
    : runner;
  const canSend = canSendMessages(task);
  const send = (text: string) => sendMessage(task.id, text);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <View style={styles.header}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Open task details"
        haptic={false}
        style={styles.headerMain}
        onPress={() => navigation.navigate(asRunner ? 'RunnerJob' : 'TaskDetail', { taskId: task.id })}
      >
        <Avatar uri={other.avatar_url} name={other.first_name} size={40} />
        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{other.first_name}</Text>
            {asRunner ? null : (
              <>
                <Icon name="star" size={iconSizes.sm} color={colors.navy} />
                <Text style={styles.rating}>{formatRating(runner.rating)}</Text>
              </>
            )}
          </View>
          <Text style={styles.taskTitle} numberOfLines={1}>
            {task.title}
          </Text>
        </View>
        <Icon name="chevron-forward" color={colors.textMuted} />
      </PressableScale>
      {/* TODO: a runner-side report flow (poster no-show, wrong code). */}
      {!asRunner && reportKind(task) && !reportFor(task.id) ? (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Report a problem"
          haptic={false}
          hitSlop={8}
          onPress={() => navigation.navigate('ReportProblem', { taskId: task.id })}
        >
          <Icon name="flag-outline" color={colors.textMuted} />
        </PressableScale>
      ) : null}
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(message) => message.id}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListHeaderComponent={<ChatSafetyBanner />}
        ListHeaderComponentStyle={styles.bannerSpacing}
        renderItem={({ item }) => (
          <MessageBubble
            content={item.content}
            sentAt={item.created_at}
            mine={item.sender_id === LOCAL_USER_ID}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Say hello to {other.first_name} and agree where and when to meet.
          </Text>
        }
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
        {__DEV__ && canSend && !asRunner ? (
          <PressableScale
            style={styles.devButton}
            haptic={false}
            onPress={() => simulateRunnerReply(task.id, runner.id)}
          >
            <Text style={styles.devButtonText}>DEV: simulate {runner.first_name} replying</Text>
          </PressableScale>
        ) : null}

        {/* Handover happens mid-chat, so the code is one tap away here too,
            but only once the runner has started (same rule as Task detail). */}
        {!asRunner && task.status === 'in-progress' && task.otp ? <HandoverCodeButton code={task.otp} /> : null}

        {canSend ? (
          <>
            <View style={styles.quickReplies}>
              <ChipRow options={QUICK_REPLIES} isSelected={() => false} onToggle={send} />
            </View>
            <MessageComposer onSend={send} />
          </>
        ) : (
          <View style={styles.readOnly}>
            <Icon name="lock-closed-outline" size={iconSizes.sm} color={colors.textMuted} />
            <Text style={styles.readOnlyText}>This task is done. Chat is read-only.</Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  headerMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerText: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { ...typography.cardTitle, color: colors.textPrimary, marginRight: 4 },
  rating: { ...typography.cardSubtitle, color: colors.textMuted },
  taskTitle: { ...typography.cardSubtitle, color: colors.accentText, marginTop: 1 },

  messages: { padding: 16, flexGrow: 1 },
  bannerSpacing: { marginBottom: 12 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: 24 },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  quickReplies: { marginBottom: 10 },
  readOnly: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  readOnlyText: { ...typography.body, color: colors.textMuted },
  devButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.warning,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  devButtonText: { ...typography.hint, color: colors.warning },

  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  centeredText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
