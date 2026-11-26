import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { RoleSelectScreen } from '../screens/auth/RoleSelectScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { RunnerSignupScreen } from '../screens/auth/RunnerSignupScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { pushedScreenOptions, rootScreenOptions } from './screenOptions';

const Stack = createNativeStackNavigator();

// Signed-out flow:
//   Onboarding → RoleSelect → Signup (poster) or RunnerSignup
//   Onboarding → Login → ForgotPassword → ResetPassword → Login
// Signing in or up flips AuthContext, and RootNavigator swaps to the app.
export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={pushedScreenOptions}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={rootScreenOptions} />
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="RunnerSignup" component={RunnerSignupScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
