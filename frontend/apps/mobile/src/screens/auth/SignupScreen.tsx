import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthLayout } from '../../components/AuthLayout';
import { FormField } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextLink } from '../../components/TextLink';
import { MIN_PASSWORD_LENGTH, useAuth } from '../../context/AuthContext';
import { isProfileComplete } from '../../utils/profileValidation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

// Poster sign-up (light, per PROJECT_OVERVIEW.md §4). Runner sign-up is
// separate because it needs verification.
export function SignupScreen() {
  const navigation = useNavigation<any>();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [hostel, setHostel] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    isProfileComplete({ fullName, email, phone, hostel }) && password.length >= MIN_PASSWORD_LENGTH;

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      await signUp({ fullName, email, phone, hostel, password });
    } catch {
      setError('Could not create your account. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      subtitle="Post tasks and get them done by verified students on campus."
      footer={
        <>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TextLink label="Log in" onPress={() => navigation.navigate('Login')} />
        </>
      }
    >
      <FormField
        label="Full name"
        placeholder="Your name"
        autoComplete="name"
        value={fullName}
        onChangeText={setFullName}
      />
      <FormField
        label="Email"
        placeholder="you@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
        hint="We'll send a code to check it's yours."
      />
      <FormField
        label="Phone number"
        placeholder="0801 234 5678"
        keyboardType="phone-pad"
        autoComplete="tel"
        value={phone}
        onChangeText={setPhone}
        hint="So your runner can reach you at handover."
      />
      {/* TODO: switch to a dropdown of named campus locations (overview §4). */}
      <FormField
        label="Hostel or area"
        placeholder="Where you stay on or near campus"
        value={hostel}
        onChangeText={setHostel}
      />
      <FormField
        label="Password"
        placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
        secureTextEntry
        autoComplete="new-password"
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton
        label="Create account"
        onPress={handleSubmit}
        disabled={!canSubmit}
        loading={loading}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  footerText: { ...typography.body, color: colors.textMuted },
  error: { ...typography.hint, color: colors.warning, marginTop: 16 },
});
