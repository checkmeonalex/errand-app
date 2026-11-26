import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ActionSheet } from './ActionSheet';
import { RUNNER_RULES } from '../constants/runnerRules';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type AcceptRulesSheetProps = {
  visible: boolean;
  onAccept: () => void;
  onClose: () => void;
};

// Shown once, on a runner's first accept, so they know the drop rules before
// they commit. Later accepts happen in one tap.
export function AcceptRulesSheet({ visible, onAccept, onClose }: AcceptRulesSheetProps) {
  return (
    <ActionSheet
      visible={visible}
      onClose={onClose}
      title="Take this task?"
      header={
        <View style={styles.rules}>
          {RUNNER_RULES.map((rule) => (
            <View key={rule} style={styles.rule}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
        </View>
      }
      options={[
        { label: 'Yes, accept', tone: 'good', onPress: onAccept },
        { label: 'Not now', tone: 'muted', onPress: onClose },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  rules: { gap: 8, marginBottom: 8 },
  rule: { flexDirection: 'row', gap: 8 },
  bullet: { ...typography.body, color: colors.textMuted },
  ruleText: { ...typography.body, color: colors.textSecondary, flex: 1 },
});
