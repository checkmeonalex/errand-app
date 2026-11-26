import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthLayout } from '../../components/AuthLayout';
import { CodeInput } from '../../components/CodeInput';
import { FormField } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextLink } from '../../components/TextLink';
import { EMAIL_CODE_LENGTH, useAuth } from '../../context/AuthContext';
import { formatCountdown, useCountdown } from '../../hooks/useCountdown';
import { isValidEmail, maskEmail } from '../../utils/profileValidation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const RESEND_AFTER_SECONDS = 60;

// Required after sign-up (and after changing the email): enter the 6-digit
// code sent to the email. Free, unlike SMS (overview §8). RootNavigator shows
// this while the email is unverified.
export function VerifyEmailScreen() {
  const { user, verifyEmail, resendEmailCode, updateProfile } = useAuth();
  const { left, restart } = useCountdown(RESEND_AFTER_SECONDS);

  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // "Wrong email? Change it" swaps the code boxes for an email field.
  const [newEmail, setNewEmail] = useState<string | null>(null);

  const email = user?.email ?? '';

  async function verify(entered = code) {
    setVerifying(true);
    setError(null);
    try {
      await verifyEmail(entered);
    } catch {
      setError("That code isn't right. Check the email and try again.");
      setCode('');
    } finally {
      setVerifying(false);
    }
  }

  async function resend() {
    await resendEmailCode();
    setNotice('New code sent.');
    restart();
  }

  async function saveNewEmail() {
    if (!newEmail || !user) return;
    await updateProfile({ full_name: user.full_name, phone: user.phone, hostel: user.hostel, email: newEmail.trim().toLowerCase() });
    await resendEmailCode();
    setNewEmail(null);
    setCode('');
    setNotice('Code sent to your new email.');
    restart();
  }

  if (newEmail !== null) {
    return (
      <AuthLayout eyebrow="Change email" title="Use a different email">
        <FormField
          label="Email"
          placeholder="you@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={newEmail}
          onChangeText={setNewEmail}
        />
        <PrimaryButton label="Send code" onPress={saveNewEmail} disabled={!isValidEmail(newEmail)} />
        <View style={styles.links}>
          <TextLink label="Cancel" onPress={() => setNewEmail(null)} />
        </View>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Verify your email"
      title={`Enter the ${EMAIL_CODE_LENGTH}-digit code`}
      subtitle={`We sent it to ${maskEmail(email)}. Can't find it? Check your spam folder.`}
    >
      <View style={styles.code}>
        <CodeInput
          length={EMAIL_CODE_LENGTH}
          value={code}
          onChange={(next) => {
            setCode(next);
            setError(null);
          }}
          onComplete={verify}
          hasError={Boolean(error)}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {notice && !error ? <Text style={styles.notice}>{notice}</Text> : null}
      {__DEV__ ? <Text style={styles.dev}>DEV: any {EMAIL_CODE_LENGTH} digits work until the backend sends real codes.</Text> : null}

      <PrimaryButton
        label="Verify"
        onPress={() => verify()}
        disabled={code.length !== EMAIL_CODE_LENGTH}
        loading={verifying}
      />

      <View style={styles.links}>
        {left > 0 ? (
          <Text style={styles.muted}>Resend code in {formatCountdown(left)}</Text>
        ) : (
          <TextLink label="Resend code" onPress={resend} />
        )}
        <TextLink label="Wrong email? Change it" onPress={() => setNewEmail(email)} />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  code: { marginTop: 24 },
  error: { ...typography.hint, color: colors.warning, textAlign: 'center', marginTop: 12 },
  notice: { ...typography.hint, color: colors.success, textAlign: 'center', marginTop: 12 },
  dev: { ...typography.hint, color: colors.warning, textAlign: 'center', marginTop: 12 },
  links: { alignItems: 'center', gap: 14, marginTop: 20 },
  muted: { ...typography.body, color: colors.textMuted },
});
