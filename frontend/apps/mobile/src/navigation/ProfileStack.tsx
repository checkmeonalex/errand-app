import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/shared/ProfileScreen';
import { EditProfileScreen } from '../screens/shared/settings/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/shared/settings/ChangePasswordScreen';
import { DeleteAccountScreen } from '../screens/shared/settings/DeleteAccountScreen';
import { PaymentHistoryScreen } from '../screens/shared/settings/PaymentHistoryScreen';
import { ReceiptScreen } from '../screens/shared/settings/ReceiptScreen';
import { NotificationsScreen } from '../screens/shared/settings/NotificationsScreen';
import { PrivacySafetyScreen } from '../screens/shared/settings/PrivacySafetyScreen';
import { PreferencesScreen } from '../screens/shared/settings/PreferencesScreen';
import { HelpSupportScreen } from '../screens/shared/settings/HelpSupportScreen';
import { AboutScreen } from '../screens/shared/settings/AboutScreen';
import { RunnerSignupScreen } from '../screens/auth/RunnerSignupScreen';
import { pushedScreenOptions, rootScreenOptions } from './screenOptions';

const Stack = createNativeStackNavigator();

// The Profile tab (poster and runner): Profile, with each settings screen
// pushed on top so they get a back button and keep the tab bar.
export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={pushedScreenOptions}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} options={rootScreenOptions} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
      <Stack.Screen name="Receipt" component={ReceiptScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="PrivacySafety" component={PrivacySafetyScreen} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
      {/* "Become a runner" → the same waitlist form as role select. */}
      <Stack.Screen name="RunnerSignup" component={RunnerSignupScreen} />
    </Stack.Navigator>
  );
}
