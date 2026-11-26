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

type SignupScreenProps = {
  navigation?: {
    navigate: (screen: string) => void;
  };
};

export default function SignupScreen({navigation}: SignupScreenProps) {
  const theme = useThemeColors();
  const styles = createGlobalStyles(theme);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit =
    fullName.trim().length > 1 &&
    email.trim().length > 0 &&
    phone.trim().length > 6 &&
    password.trim().length >= 6;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.contentCenter}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Get started</Text>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>
              Join Errand to post tasks, find trusted student runners, and keep
              every request easy to track.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                autoComplete="name"
                onChangeText={setFullName}
                placeholder="Your name"
                placeholderTextColor={theme.textDim}
                style={styles.input}
                value={fullName}
              />
            </View>

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
              <Text style={styles.label}>Phone number</Text>
              <TextInput
                autoComplete="tel"
                keyboardType="phone-pad"
                onChangeText={setPhone}
                placeholder="+234 800 000 0000"
                placeholderTextColor={theme.textDim}
                style={styles.input}
                value={phone}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
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

            <Pressable
              accessibilityRole="button"
              disabled={!canSubmit}
              onPress={() => navigation?.navigate('EmailVerification')}
              style={({pressed}) => [
                styles.primaryButtonSpaced,
                !canSubmit && styles.disabledButton,
                pressed && canSubmit && styles.pressedButton,
              ]}>
              <Text style={styles.primaryButtonLabel}>Create account</Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation?.navigate('Login')}>
              <Text style={styles.footerLink}>Log in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
