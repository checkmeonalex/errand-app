import React, { useState } from 'react';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomActionBar } from '../../components/BottomActionBar';
import { ChipRow } from '../../components/ChipRow';
import { DoneMessage } from '../../components/DoneMessage';
import { FormField } from '../../components/FormField';
import { SettingsPage } from '../../components/SettingsPage';
import { TextLink } from '../../components/TextLink';
import { CATEGORIES } from '../../constants/categories';
import { LOCAL_USER_ID } from '../../constants/localUser';
import { useAuth } from '../../context/AuthContext';
import { useMode } from '../../context/ModeContext';
import { useRunnerWaitlist } from '../../hooks/useRunnerWaitlist';
import { formatDate } from '../../utils/formatDate';
import { isValidEmail } from '../../utils/profileValidation';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const LAUNCH_CATEGORIES = CATEGORIES.filter((category) => !category.comingSoon);

// "I want to earn" (role select) and "Become a runner" (Profile). Runners are
// added by the Taskly team, so this joins the waitlist: no invite codes yet.
// Signed-in posters are prefilled and sent with their user id for priority.
export function RunnerSignupScreen() {
  const navigation = useNavigation<any>();
  const { user, isSignedIn } = useAuth();
  const { devGrantRunnerAccess, switchMode } = useMode();
  const { entry, isLoading, join } = useRunnerWaitlist();

  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [departmentLevel, setDepartmentLevel] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [busy, setBusy] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.navy} />
      </View>
    );
  }

  if (entry) {
    return (
      <View style={styles.root}>
        <DoneMessage
          icon="hourglass-outline"
          title="You're on the waitlist"
          text={`Joined ${formatDate(entry.created_at)}. We open runner spots in batches as more tasks come in, and we'll email ${entry.email} when yours is ready.`}
          buttonLabel="Back"
          onDone={() => navigation.goBack()}
        />
        {__DEV__ && isSignedIn ? (
          <View style={styles.devLink}>
            <TextLink
              label="DEV: skip the waitlist and become a runner"
              onPress={async () => {
                await devGrantRunnerAccess();
                switchMode('runner');
              }}
            />
          </View>
        ) : null}
      </View>
    );
  }

  const errors = {
    fullName: fullName.trim() ? null : 'Enter your full name',
    email: isValidEmail(email) ? null : 'Enter a valid email',
    phone: phone.replace(/\D/g, '').length >= 10 ? null : 'Enter your phone number',
    departmentLevel: departmentLevel.trim() ? null : 'e.g. Computer Science, ND2',
    categories: categories.length ? null : 'Pick at least one',
  };
  const isValid = Object.values(errors).every((error) => !error);
  const show = (error: string | null) => (showErrors ? error : null);

  async function submit() {
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    setBusy(true);
    await join({
      // TODO: the backend takes the user id from the session, not the app.
      user_id: isSignedIn ? LOCAL_USER_ID : undefined,
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      department_level: departmentLevel.trim(),
      categories,
    });
    setBusy(false);
  }

  return (
    <SettingsPage
      title="Join the runner waitlist"
      subtitle="Earn by doing tasks for other students. We're adding runners in small batches so everyone gets enough tasks."
      footer={<BottomActionBar primary={{ label: 'Join the waitlist', loading: busy, onPress: submit }} />}
    >
      <FormField label="Full name" value={fullName} onChangeText={setFullName} error={show(errors.fullName)} autoComplete="name" />
      <FormField
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={show(errors.email)}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <FormField label="Phone" value={phone} onChangeText={setPhone} error={show(errors.phone)} keyboardType="phone-pad" />
      <FormField
        label="Department and level"
        value={departmentLevel}
        onChangeText={setDepartmentLevel}
        error={show(errors.departmentLevel)}
        placeholder="Computer Science, ND2"
      />

      <Text style={styles.label}>Tasks you'd like to do</Text>
      <ChipRow
        options={LAUNCH_CATEGORIES.map((category) => category.label)}
        isSelected={(label) => categories.includes(idFor(label))}
        onToggle={(label) => {
          const id = idFor(label);
          setCategories(categories.includes(id) ? categories.filter((c) => c !== id) : [...categories, id]);
        }}
      />
      {show(errors.categories) ? <Text style={styles.error}>{errors.categories}</Text> : null}
    </SettingsPage>
  );
}

function idFor(label: string): string {
  return LAUNCH_CATEGORIES.find((category) => category.label === label)?.id ?? label;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  label: { ...typography.sectionLabel, color: colors.textSecondary, marginTop: 20, marginBottom: 10 },
  error: { ...typography.hint, color: colors.warning, marginTop: 6 },
  devLink: { alignItems: 'center', paddingBottom: 32 },
});
