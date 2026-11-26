import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextLink } from '../../components/TextLink';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

// First screen a signed-out user sees. New users go to RoleSelect;
// returning users go straight to Login.
export function OnboardingScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.hero}>
        <Text style={styles.appName}>Taskly</Text>
        <Text style={styles.tagline}>
          Get small tasks done on campus, or earn by doing them. Payment is held
          safely until the task is done.
        </Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Get started" onPress={() => navigation.navigate('RoleSelect')} />
        <View style={styles.loginRow}>
          <Text style={styles.loginPrompt}>Already have an account?</Text>
          <TextLink label="Log in" onPress={() => navigation.navigate('Login')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy, padding: 24, justifyContent: 'space-between' },
  hero: { flex: 1, justifyContent: 'center' },
  appName: { ...typography.title, color: colors.white },
  tagline: { ...typography.body, color: colors.navyMuted, marginTop: 10 },
  actions: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 18,
    paddingTop: 0,
  },
  loginRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 16 },
  loginPrompt: { ...typography.body, color: colors.textMuted },
});
