import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthLayout } from '../../components/AuthLayout';
import { FormField } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextLink } from '../../components/TextLink';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export function LoginScreen() {
  const navigation = useNavigation<any>();
  const { signIn } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = identifier.trim().length > 0 && password.length > 0;

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      await signIn({ identifier, password });
    } catch {
      setError('Wrong phone, email or password. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in to Taskly"
      footer={
        <>
          <Text style={styles.footerText}>New to Taskly?</Text>
          <TextLink label="Create an account" onPress={() => navigation.navigate('RoleSelect')} />
        </>
      }
    >
      <FormField
        label="Email or phone number"
        placeholder="you@gmail.com or 0801 234 5678"
        autoCapitalize="none"
        value={identifier}
        onChangeText={setIdentifier}
      />
      <FormField
        label="Password"
        placeholder="Your password"
        secureTextEntry
        autoComplete="password"
        value={password}
        onChangeText={setPassword}
      />
      <View style={styles.forgotRow}>
        <TextLink label="Forgot password?" onPress={() => navigation.navigate('ForgotPassword')} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton label="Log in" onPress={handleSubmit} disabled={!canSubmit} loading={loading} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  forgotRow: { alignItems: 'flex-end', marginTop: 12 },
  footerText: { ...typography.body, color: colors.textMuted },
  error: { ...typography.hint, color: colors.warning, marginTop: 16 },
});
