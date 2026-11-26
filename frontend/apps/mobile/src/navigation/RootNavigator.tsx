import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthStack } from './AuthStack';
import { PosterStack } from './PosterStack';
import { RunnerStack } from './RunnerStack';
import { LoadingScreen } from '../components/LoadingScreen';
import { AddPhotoScreen } from '../screens/auth/AddPhotoScreen';
import { VerifyEmailScreen } from '../screens/auth/VerifyEmailScreen';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';

// This is the ONLY file that decides which top-level experience a user sees:
// signed out → AuthStack; email not verified → VerifyEmailScreen; no profile
// photo → AddPhotoScreen;
// otherwise the poster or runner tabs, based on
// the live mode in ModeContext. Nothing else should branch on auth or mode.
export function RootNavigator() {
  const { isSignedIn, user, isRestoring: authRestoring } = useAuth();
  const { activeMode, isRestoring: modeRestoring } = useMode();

  // Wait for the saved session and mode, so onboarding doesn't flash
  // before home on every launch.
  if (authRestoring || modeRestoring) return <LoadingScreen />;

  return (
    <NavigationContainer>
      {!isSignedIn ? (
        <AuthStack />
      ) : user?.email && !user.email_verified ? (
        // A new or changed email must be verified first (free 6-digit code).
        <VerifyEmailScreen />
      ) : !user?.avatar_url ? (
        // A profile photo is required before using the app (both modes).
        <AddPhotoScreen />
      ) : activeMode === 'poster' ? (
        <PosterStack />
      ) : (
        <RunnerStack />
      )}
    </NavigationContainer>
  );
}
