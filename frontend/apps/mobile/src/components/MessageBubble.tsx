import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatTime } from '../utils/formatTime';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type MessageBubbleProps = {
  content: string;
  sentAt: string;
  // My messages sit on the right in navy; theirs on the left in light blue.
  mine: boolean;
};

export function MessageBubble({ content, sentAt, mine }: MessageBubbleProps) {
  return (
    <View style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}>
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.content, mine && styles.contentMine]}>{content}</Text>
        <Text style={[styles.time, mine && styles.timeMine]}>{formatTime(sentAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: 3 },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 12 },
  bubbleMine: { backgroundColor: colors.navy, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: colors.accentLight, borderBottomLeftRadius: 4 },
  content: { ...typography.body, color: colors.textPrimary },
  contentMine: { color: colors.white },
  time: { ...typography.badge, color: colors.accentText, marginTop: 4, alignSelf: 'flex-end' },
  timeMine: { color: colors.navyMuted },
});
