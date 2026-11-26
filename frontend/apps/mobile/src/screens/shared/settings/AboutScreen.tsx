import React from 'react';
import { Text, StyleSheet } from 'react-native';
import appConfig from '../../../../app.json';
import { SettingsPage } from '../../../components/SettingsPage';
import { SettingsRow } from '../../../components/SettingsRow';
import { SettingsSection } from '../../../components/SettingsSection';
import { PRIVACY_POLICY_URL, TERMS_URL } from '../../../constants/supportInfo';
import { linkHandler } from '../../../utils/linkHandler';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

// Settings → About: the real app name and version (from app.json) and the
// legal documents ("Coming soon" until their links are set in supportInfo.ts).
export function AboutScreen() {
  return (
    <SettingsPage title="About">
      <SettingsSection>
        <SettingsRow icon="information-circle-outline" label="App" value={appConfig.expo.name} />
        <SettingsRow icon="pricetag-outline" label="Version" value={appConfig.expo.version} />
      </SettingsSection>

      <SettingsSection title="Legal">
        <SettingsRow
          icon="document-text-outline"
          label="Terms of Service"
          value={TERMS_URL ? undefined : 'Coming soon'}
          onPress={linkHandler(TERMS_URL)}
        />
        <SettingsRow
          icon="shield-outline"
          label="Privacy policy"
          value={PRIVACY_POLICY_URL ? undefined : 'Coming soon'}
          onPress={linkHandler(PRIVACY_POLICY_URL)}
        />
      </SettingsSection>

      <Text style={styles.footer}>Made for students at Yaba College of Technology.</Text>
    </SettingsPage>
  );
}

const styles = StyleSheet.create({
  footer: { ...typography.hint, color: colors.textMuted, textAlign: 'center', marginTop: 24 },
});
