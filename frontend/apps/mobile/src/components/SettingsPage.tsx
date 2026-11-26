import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type SettingsPageProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  // Pinned at the bottom, e.g. a BottomActionBar with "Save".
  footer?: React.ReactNode;
};

// The shared frame for every settings screen: title, optional subtitle,
// scrolling content (keyboard-safe for forms) and an optional pinned footer.
export function SettingsPage({ title, subtitle, children, footer }: SettingsPageProps) {
  const headerHeight = useHeaderHeight();

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View>{children}</View>
      </ScrollView>
      {footer}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { ...typography.title, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: 6 },
});
