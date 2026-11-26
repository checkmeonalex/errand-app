import React, {useMemo, useState} from 'react';
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

type EmailVerificationScreenProps = {
  navigation?: {
    navigate: (screen: string) => void;
  };
};

export default function EmailVerificationScreen({
  navigation,
}: EmailVerificationScreenProps) {
  const theme = useThemeColors();
  const styles = createGlobalStyles(theme);
  const [code, setCode] = useState('');
  const codeSlots = useMemo(() => {
    const paddedCode = code.padEnd(6, ' ');
    return paddedCode.slice(0, 6).split('');
  }, [code]);

  const canSubmit = code.trim().length === 6;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.contentCenter}
          keyboardShouldPersistTaps="handled">
          <View style={styles.headerLarge}>
            <Text style={styles.eyebrow}>Verify email</Text>
            <Text style={styles.title}>Enter your code</Text>
            <Text style={styles.subtitle}>
              Add the 6-digit code sent to your email to continue setting up
              your Errand profile.
            </Text>
          </View>

          <View style={styles.codePreview}>
            {codeSlots.map((digit, index) => (
              <View key={`${index}-${digit}`} style={styles.codeBox}>
                <Text style={styles.codeText}>{digit.trim()}</Text>
              </View>
            ))}
          </View>

          <TextInput
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={setCode}
            placeholder="Enter code"
            placeholderTextColor={theme.textDim}
            style={styles.hiddenInput}
            value={code}
          />

          <Pressable
            accessibilityRole="button"
            disabled={!canSubmit}
            onPress={() => navigation?.navigate('ProfileSetup')}
            style={({pressed}) => [
              styles.primaryButton,
              !canSubmit && styles.disabledButton,
              pressed && canSubmit && styles.pressedButton,
            ]}>
            <Text style={styles.primaryButtonLabel}>Verify email</Text>
          </Pressable>

          <Pressable accessibilityRole="button" style={styles.textButtonCenter}>
            <Text style={styles.textButtonLabelLarge}>Resend code</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
