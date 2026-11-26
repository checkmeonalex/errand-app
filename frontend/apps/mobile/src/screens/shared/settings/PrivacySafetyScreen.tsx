import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from '../../../components/Icon';
import { SettingsPage } from '../../../components/SettingsPage';
import { SettingsSection } from '../../../components/SettingsSection';
import { ToggleRow } from '../../../components/ToggleRow';
import { SAFETY_TIPS } from '../../../constants/safetyTips';
import { useAuth } from '../../../context/AuthContext';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

// Settings → Privacy & safety: leaderboard visibility and how Taskly keeps
// people safe.
export function PrivacySafetyScreen() {
  const { user, setShowOnLeaderboards } = useAuth();

  return (
    <SettingsPage title="Privacy & safety">
      <SettingsSection title="Privacy">
        <ToggleRow
          label="Show me on leaderboards"
          hint="Only your first name and last initial are shown."
          value={user?.show_on_leaderboards !== false}
          onChange={setShowOnLeaderboards}
        />
      </SettingsSection>

      <SettingsSection title="How Taskly keeps you safe">
        {SAFETY_TIPS.map((tip) => (
          <View key={tip.title} style={styles.tip}>
            <Icon name={tip.icon} color={colors.accentText} />
            <View style={styles.tipText}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipBody}>{tip.text}</Text>
            </View>
          </View>
        ))}
      </SettingsSection>
    </SettingsPage>
  );
}

const styles = StyleSheet.create({
  tip: { flexDirection: 'row', gap: 12, padding: 14 },
  tipText: { flex: 1 },
  tipTitle: { ...typography.cardTitle, color: colors.textPrimary },
  tipBody: { ...typography.body, color: colors.textMuted, marginTop: 2 },
});
