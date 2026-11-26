import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type MessageComposerProps = {
  onSend: (text: string) => void;
};

// Text box + round send button at the bottom of a chat.
export function MessageComposer({ onSend }: MessageComposerProps) {
  const [text, setText] = useState('');
  const canSend = text.trim().length > 0;

  function send() {
    if (!canSend) return;
    onSend(text);
    setText('');
  }

  return (
    <View style={styles.row}>
      <TextInput
        style={styles.input}
        placeholder="Type a message"
        placeholderTextColor={colors.textMuted}
        value={text}
        onChangeText={setText}
        multiline
        onSubmitEditing={send}
        blurOnSubmit={false}
      />
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Send message"
        style={[styles.send, !canSend && styles.sendDisabled]}
        disabled={!canSend}
        onPress={send}
      >
        <Icon name="send" color={colors.white} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  input: {
    ...typography.input,
    color: colors.textPrimary,
    flex: 1,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  send: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.4 },
});
