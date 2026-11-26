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

type LoginScreenProps = {
  navigation?: {
    navigate: (screen: string) => void;
  };
};

export default function LoginScreen({navigation}: LoginScreenProps) {
  const theme = useThemeColors();
  const styles = createGlobalStyles(theme);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit = email.trim().length > 0 && password.trim().length >= 6;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.contentCenter}
          keyboardShouldPersistTaps="handled">
          <View style={styles.headerLarge}>
            <Text style={styles.eyebrow}>Welcome back</Text>
            <Text style={styles.titleLarge}>Log in to Errand</Text>
            <Text style={styles.subtitle}>
              Continue managing errands, tracking requests, and getting help
              when you need it.
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

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                autoComplete="password"
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={theme.textDim}
                secureTextEntry
                style={styles.input}
                value={password}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => navigation?.navigate('ForgotPassword')}
              style={styles.textButtonEnd}>
              <Text style={styles.textButtonLabel}>Forgot password?</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={!canSubmit}
              onPress={() => navigation?.navigate('CustomerHome')}
              style={({pressed}) => [
                styles.primaryButton,
                !canSubmit && styles.disabledButton,
                pressed && canSubmit && styles.pressedButton,
              ]}>
              <Text style={styles.primaryButtonLabel}>Log in</Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to Errand?</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation?.navigate('Signup')}>
              <Text style={styles.footerLink}>Create an account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
