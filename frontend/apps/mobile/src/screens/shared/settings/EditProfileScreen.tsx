import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomActionBar } from '../../../components/BottomActionBar';
import { FormField } from '../../../components/FormField';
import { SettingsPage } from '../../../components/SettingsPage';
import { useAuth } from '../../../context/AuthContext';
import { isProfileComplete } from '../../../utils/profileValidation';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

// Settings → Edit profile: the same details asked at sign-up. A new email
// sends the user to VerifyEmailScreen (RootNavigator) before anything else.
export function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [hostel, setHostel] = useState(user?.hostel ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = isProfileComplete({ fullName, email, phone, hostel });

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        hostel: hostel.trim(),
      });
      navigation.goBack();
    } catch {
      setError("Couldn't save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsPage
      title="Edit profile"
      footer={<BottomActionBar primary={{ label: 'Save changes', onPress: save, loading: saving, disabled: !canSave }} />}
    >
      <FormField label="Full name" autoComplete="name" value={fullName} onChangeText={setFullName} />
      <FormField
        label="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
        hint="Changing it means verifying the new one with a code."
      />
      <FormField
        label="Phone number"
        keyboardType="phone-pad"
        autoComplete="tel"
        value={phone}
        onChangeText={setPhone}
      />
      <FormField
        label="Hostel or area"
        placeholder="Where you stay on or near campus"
        value={hostel}
        onChangeText={setHostel}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </SettingsPage>
  );
}

const styles = StyleSheet.create({
  error: { ...typography.hint, color: colors.warning, marginTop: 16 },
});
