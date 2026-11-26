import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Message, Task } from '@errand/types';
import { PressableScale } from './PressableScale';
import { Avatar } from './Avatar';
import { formatTime } from '../utils/formatTime';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type ChatListRowProps = {
  task: Pick<Task, 'title' | 'runner'>;
  lastMessage?: Message;
  unread: number;
  onPress: () => void;
};

// One chat in the list: the other person, which task it's about, the last
// message and an unread count.
export function ChatListRow({ task, lastMessage, unread, onPress }: ChatListRowProps) {
  const name = task.runner?.first_name ?? 'Runner';

  return (
    <PressableScale accessibilityRole="button" style={styles.row} onPress={onPress}>
      <Avatar uri={task.runner?.avatar_url} name={name} size={46} />
      <View style={styles.text}>
        <View style={styles.topLine}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {lastMessage ? <Text style={styles.time}>{formatTime(lastMessage.created_at)}</Text> : null}
        </View>
        <Text style={styles.task} numberOfLines={1}>
          {task.title}
        </Text>
        <View style={styles.bottomLine}>
          <Text style={[styles.preview, unread > 0 && styles.previewUnread]} numberOfLines={1}>
            {lastMessage?.content ?? 'Say hello and agree the details'}
          </Text>
          {unread > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  text: { flex: 1 },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  name: { ...typography.cardTitle, color: colors.textPrimary, flex: 1 },
  time: { ...typography.cardSubtitle, color: colors.textMuted },
  task: { ...typography.cardSubtitle, color: colors.accentText, marginTop: 1 },
  bottomLine: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  preview: { ...typography.body, color: colors.textMuted, flex: 1 },
  previewUnread: { color: colors.textPrimary },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { ...typography.pill, color: colors.white },
});
