import React from 'react';
import { ActivityIndicator, FlatList, Text, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChatListRow } from '../../components/ChatListRow';
import { Icon } from '../../components/Icon';
import { useChat } from '../../context/ChatContext';
import { useTasks } from '../../context/TasksContext';
import { colors } from '../../theme/colors';
import { iconSizes, typography } from '../../theme/typography';

// Every task chat, newest activity first. A task gets a chat once a runner
// accepts it (one chat per task). Opened from the chat icon on home.
export function ChatListScreen() {
  const navigation = useNavigation<any>();
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { messagesFor, unreadCount, isLoading: chatLoading } = useChat();

  const threads = tasks
    .filter((task) => task.runner)
    .map((task) => {
      const messages = messagesFor(task.id);
      const lastMessage = messages[messages.length - 1];
      return { task, lastMessage, activity: lastMessage?.created_at ?? task.updated_at };
    })
    .sort((a, b) => b.activity.localeCompare(a.activity));

  if (tasksLoading || chatLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.navy} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={threads}
        keyExtractor={(thread) => thread.task.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ChatListRow
            task={item.task}
            lastMessage={item.lastMessage}
            unread={unreadCount(item.task.id)}
            onPress={() => navigation.navigate('ChatThread', { taskId: item.task.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Icon name="chatbubbles-outline" size={iconSizes.lg} color={colors.accentText} />
            </View>
            <Text style={styles.emptyTitle}>No chats yet</Text>
            <Text style={styles.emptyText}>
              Chats open when a runner accepts one of your tasks.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 },
  title: { ...typography.title, color: colors.textPrimary },
  list: { paddingTop: 8, paddingBottom: 32, flexGrow: 1 },
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
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
