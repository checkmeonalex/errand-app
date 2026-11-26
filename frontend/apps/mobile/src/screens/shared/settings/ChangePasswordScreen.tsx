import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomActionBar } from '../../../components/BottomActionBar';
import { FormField } from '../../../components/FormField';
import { SettingsPage } from '../../../components/SettingsPage';
import { MIN_PASSWORD_LENGTH, useAuth } from '../../../context/AuthContext';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

// Settings → Change password.
export function ChangePasswordScreen() {
  const navigation = useNavigation<any>();
  const { changePassword } = useAuth();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mismatch = confirm.length > 0 && next !== confirm;
  const canSave = current.length > 0 && next.length >= MIN_PASSWORD_LENGTH && next === confirm;

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await changePassword(current, next);
      navigation.goBack();
    } catch {
      setError("Couldn't change your password. Check your current password and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsPage
      title="Change password"
      footer={<BottomActionBar primary={{ label: 'Update password', onPress: save, loading: saving, disabled: !canSave }} />}
    >
      <FormField
        label="Current password"
        secureTextEntry
        autoComplete="password"
        value={current}
        onChangeText={setCurrent}
      />
      <FormField
        label="New password"
        placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
        secureTextEntry
        autoComplete="new-password"
        value={next}
        onChangeText={setNext}
      />
      <FormField
        label="Confirm new password"
        secureTextEntry
        autoComplete="new-password"
        value={confirm}
        onChangeText={setConfirm}
        error={mismatch ? 'Passwords do not match' : null}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </SettingsPage>
  );
}

const styles = StyleSheet.create({
  error: { ...typography.hint, color: colors.warning, marginTop: 16 },
});
