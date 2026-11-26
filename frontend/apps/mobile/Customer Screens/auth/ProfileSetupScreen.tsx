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

type ProfileSetupScreenProps = {
  navigation?: {
    navigate: (screen: string) => void;
  };
};

const campusOptions = ['University of Lagos', 'Yaba College', 'Other campus'];

export default function ProfileSetupScreen({navigation}: ProfileSetupScreenProps) {
  const theme = useThemeColors();
  const styles = createGlobalStyles(theme);
  const [campus, setCampus] = useState(campusOptions[0]);
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');

  const canSubmit = campus.trim().length > 0 && address.trim().length > 4;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.contentTop}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Profile setup</Text>
            <Text style={styles.title}>Set up your customer profile</Text>
            <Text style={styles.subtitle}>
              Add the details runners will use to understand where errands
              usually happen.
            </Text>
          </View>

          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>ER</Text>
          </View>

          <View style={styles.formLoose}>
            <View style={styles.field}>
              <Text style={styles.label}>Primary campus or area</Text>
              <View style={styles.optionRow}>
                {campusOptions.map(option => (
                  <Pressable
                    accessibilityRole="button"
                    key={option}
                    onPress={() => setCampus(option)}
                    style={[
                      styles.optionButton,
                      campus === option && styles.selectedOptionButton,
                    ]}>
                    <Text
                      style={[
                        styles.optionLabel,
                        campus === option && styles.selectedOptionLabel,
                      ]}>
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Default errand address</Text>
              <TextInput
                multiline
                onChangeText={setAddress}
                placeholder="Hostel, faculty, apartment, or street"
                placeholderTextColor={theme.textDim}
                style={[styles.input, styles.textArea]}
                value={address}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Profile note</Text>
              <TextInput
                multiline
                onChangeText={setBio}
                placeholder="Anything runners should know before accepting your errands"
                placeholderTextColor={theme.textDim}
                style={[styles.input, styles.textArea]}
                value={bio}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={!canSubmit}
              onPress={() => navigation?.navigate('CustomerHome')}
              style={({pressed}) => [
                styles.primaryButtonSpaced,
                !canSubmit && styles.disabledButton,
                pressed && canSubmit && styles.pressedButton,
              ]}>
              <Text style={styles.primaryButtonLabel}>Finish setup</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
