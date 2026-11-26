import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { AuthLayout } from '../../components/AuthLayout';
import { FormField } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { isValidEmail } from '../../utils/profileValidation';

// Step 1 of password reset: ask where to send the reset code.
export function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const [identifier, setIdentifier] = useState('');

  function handleSubmit() {
    // TODO: Supabase Auth password reset: emails a code (free, no SMS).
    navigation.navigate('ResetPassword');
  }

  return (
    <AuthLayout
      eyebrow="Password help"
      title="Forgot your password?"
      subtitle="Enter your account email and we'll send you a reset code."
    >
      <FormField
        label="Email"
        placeholder="you@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={identifier}
        onChangeText={setIdentifier}
      />
      <PrimaryButton
        label="Send reset code"
        onPress={handleSubmit}
        disabled={!isValidEmail(identifier)}
      />
    </AuthLayout>
  );
}
