import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { formatTime } from '../utils/formatTime';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type NotificationRowProps = {
  icon: IconName;
  title: string;
  body: string;
  createdAt: string;
  unread: boolean;
  onPress: () => void;
};

// One notification: icon, what happened, when, and a dot while unread.
export function NotificationRow({ icon, title, body, createdAt, unread, onPress }: NotificationRowProps) {
  return (
    <PressableScale accessibilityRole="button" haptic={false} style={[styles.row, unread && styles.rowUnread]} onPress={onPress}>
      <View style={styles.iconBadge}>
        <Icon name={icon} color={colors.accentText} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, unread && styles.titleUnread]}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        <Text style={styles.time}>{formatTime(createdAt)}</Text>
      </View>
      {unread ? <View style={styles.dot} /> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, padding: 14, backgroundColor: colors.background },
  rowUnread: { backgroundColor: colors.accentLight },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
  title: { ...typography.body, color: colors.textPrimary },
  titleUnread: { ...typography.cardTitle },
  body: { ...typography.cardSubtitle, color: colors.textMuted },
  time: { ...typography.hint, color: colors.textMuted, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.warning, marginTop: 6 },
});
