import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type AuthLayoutProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  // Optional row under the form, e.g. "Already have an account? Log in".
  footer?: React.ReactNode;
};

// Shared frame for every auth screen: keyboard-safe scroll area, heading
// block, then the screen's own form.
export function AuthLayout({ eyebrow, title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <View style={styles.form}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingBottom: 40 },
  eyebrow: { ...typography.eyebrow, color: colors.accentText, textTransform: 'uppercase' },
  title: { ...typography.title, color: colors.textPrimary, marginTop: 6 },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: 8 },
  form: { marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 24 },
});
