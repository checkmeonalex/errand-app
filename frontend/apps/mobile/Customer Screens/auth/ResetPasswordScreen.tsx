import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {createGlobalStyles, useThemeColors} from '../../styles/globalStyles';

type ResetPasswordScreenProps = {
  navigation?: {
    navigate: (screen: string) => void;
  };
};

export default function ResetPasswordScreen({navigation}: ResetPasswordScreenProps) {
  const theme = useThemeColors();
  const styles = createGlobalStyles(theme);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit =
    code.trim().length >= 4 && password.length >= 6 && passwordsMatch;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.contentCenter}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Reset password</Text>
            <Text style={styles.title}>Choose a new password</Text>
            <Text style={styles.subtitle}>
              Use the reset code from your email and set a password you can
              remember.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Reset code</Text>
              <TextInput
                keyboardType="number-pad"
                maxLength={6}
                onChangeText={setCode}
                placeholder="000000"
                placeholderTextColor={theme.textDim}
                style={styles.input}
                value={code}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>New password</Text>
              <TextInput
                autoComplete="new-password"
                onChangeText={setPassword}
                placeholder="At least 6 characters"
                placeholderTextColor={theme.textDim}
                secureTextEntry
                style={styles.input}
                value={password}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirm password</Text>
              <TextInput
                autoComplete="new-password"
                onChangeText={setConfirmPassword}
                placeholder="Repeat your new password"
                placeholderTextColor={theme.textDim}
                secureTextEntry
                style={styles.input}
                value={confirmPassword}
              />
              {confirmPassword.length > 0 && !passwordsMatch ? (
                <Text style={styles.errorText}>Passwords do not match.</Text>
              ) : null}
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={!canSubmit}
              onPress={() => navigation?.navigate('Login')}
              style={({pressed}) => [
                styles.primaryButtonSpaced,
                !canSubmit && styles.disabledButton,
                pressed && canSubmit && styles.pressedButton,
              ]}>
              <Text style={styles.primaryButtonLabel}>Save password</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
