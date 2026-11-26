import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { AuthLayout } from '../../components/AuthLayout';
import { FormField } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { MIN_PASSWORD_LENGTH } from '../../context/AuthContext';

// Step 2 of password reset: enter the code and choose a new password.
export function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordsMatch = password === confirmPassword;
  const canSubmit =
    code.trim().length >= 4 && password.length >= MIN_PASSWORD_LENGTH && passwordsMatch;

  function handleSubmit() {
    // TODO: send code + new password to @errand/api; show its error if it fails.
    navigation.navigate('Login');
  }

  return (
    <AuthLayout
      eyebrow="Reset password"
      title="Choose a new password"
      subtitle="Enter the code we sent you and a password you'll remember."
    >
      <FormField
        label="Reset code"
        placeholder="000000"
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={setCode}
      />
      <FormField
        label="New password"
        placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
        secureTextEntry
        autoComplete="new-password"
        value={password}
        onChangeText={setPassword}
      />
      <FormField
        label="Confirm new password"
        placeholder="Type it again"
        secureTextEntry
        autoComplete="new-password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={confirmPassword.length > 0 && !passwordsMatch ? 'Passwords do not match' : null}
      />
      <PrimaryButton label="Save password" onPress={handleSubmit} disabled={!canSubmit} />
    </AuthLayout>
  );
}
