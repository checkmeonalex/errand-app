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

type ForgotPasswordScreenProps = {
  navigation?: {
    goBack: () => void;
    navigate: (screen: string) => void;
  };
};

export default function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordScreenProps) {
  const theme = useThemeColors();
  const styles = createGlobalStyles(theme);
  const [email, setEmail] = useState('');
  const canSubmit = email.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.contentCenter}
          keyboardShouldPersistTaps="handled">
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation?.goBack()}
            style={styles.backButton}>
            <Text style={styles.backButtonLabel}>Back</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.eyebrow}>Password help</Text>
            <Text style={styles.title}>Forgot password?</Text>
            <Text style={styles.subtitle}>
              Enter your email and we will show the reset flow placeholder for
              now.
            </Text>
          </View>

          <View style={styles.formLoose}>
            <View style={styles.field}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={theme.textDim}
                style={styles.input}
                value={email}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={!canSubmit}
              onPress={() => navigation?.navigate('ResetPassword')}
              style={({pressed}) => [
                styles.primaryButton,
                !canSubmit && styles.disabledButton,
                pressed && canSubmit && styles.pressedButton,
              ]}>
              <Text style={styles.primaryButtonLabel}>Continue</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
