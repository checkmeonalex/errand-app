import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Profile } from '@errand/types';
import { loadJSON, removeKey, saveJSON, STORAGE_KEYS } from '../storage/storage';

export const MIN_PASSWORD_LENGTH = 6;
export const EMAIL_CODE_LENGTH = 6;

// Email or phone number, plus password.
export type SignInDetails = { identifier: string; password: string };

export type SignUpDetails = {
  fullName: string;
  email: string;
  phone: string;
  hostel: string;
  password: string;
};

// The bits of the signed-in user's profile the app shows today.
export type AuthUser = Pick<
  Profile,
  | 'full_name'
  | 'phone'
  | 'email'
  | 'email_verified'
  | 'school_id'
  | 'hostel'
  | 'avatar_url'
  | 'badges'
  | 'show_on_leaderboards'
>;

// Edit profile: name, email, phone, hostel.
export type ProfileDetails = Pick<AuthUser, 'full_name' | 'email' | 'phone' | 'hostel'>;

// What's saved on the device so a reload keeps you signed in.
// Never includes the password.
type SavedSession = { user: AuthUser | null };

type AuthContextValue = {
  isSignedIn: boolean;
  // null when signed out, or when signed in but the profile isn't known yet.
  user: AuthUser | null;
  // True until the saved session has been read on launch.
  isRestoring: boolean;
  signIn: (details: SignInDetails) => Promise<void>;
  signUp: (details: SignUpDetails) => Promise<void>;
  signOut: () => void;
  // Email verification (code sent at sign-up and after changing the email).
  verifyEmail: (code: string) => Promise<void>;
  resendEmailCode: () => Promise<void>;
  // Leaderboard opt-out (shown on boards unless turned off).
  setShowOnLeaderboards: (show: boolean) => Promise<void>;
  // Sets the (required) profile photo.
  setAvatar: (uri: string) => Promise<void>;
  // Changing the email means verifying the new one.
  updateProfile: (details: ProfileDetails) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
  // Removes the account and signs out. Callers also clear tasks and chats.
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// MOCK auth so the whole flow works before the backend exists. Any details
// are accepted; the session is saved on the device so reloads keep you in.
// TODO: replace with @errand/api / Supabase Auth calls, load the user's
// Profile after sign-in, and keep the real session in secure storage
// (expo-secure-store or the Supabase client's own storage).
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    loadJSON<SavedSession>(STORAGE_KEYS.session).then((saved) => {
      if (saved) {
        setUser(saved.user);
        setIsSignedIn(true);
      }
      setIsRestoring(false);
    });
  }, []);

  async function startSession(nextUser: AuthUser | null) {
    setUser(nextUser);
    setIsSignedIn(true);
    await saveJSON(STORAGE_KEYS.session, { user: nextUser } satisfies SavedSession);
  }

  // A profile to update after a mock log-in, when nothing is known yet.
  const current = (): AuthUser => ({ full_name: '', phone: '', ...user });

  async function signIn(_details: SignInDetails) {
    // No backend to look up the profile yet, so the name is unknown after
    // logging in (home shows "Hi there").
    await startSession(null);
  }

  // TODO: Supabase Auth sign-up; it emails the 6-digit code.
  async function signUp(details: SignUpDetails) {
    await startSession({
      full_name: details.fullName.trim(),
      email: details.email.trim().toLowerCase(),
      email_verified: false,
      phone: details.phone.trim(),
      hostel: details.hostel.trim(),
    });
  }

  function signOut() {
    setUser(null);
    setIsSignedIn(false);
    removeKey(STORAGE_KEYS.session);
  }

  // TODO: auth.verifyEmail(code) via Supabase Auth (email OTP).
  // Dev builds accept any 6 digits; release builds have no fake pass.
  async function verifyEmail(code: string) {
    if (!__DEV__) throw new Error('Email verification needs the backend');
    if (code.length !== EMAIL_CODE_LENGTH) throw new Error('Wrong code');
    await startSession({ ...current(), email_verified: true });
  }

  // TODO: auth.resendEmailCode via Supabase Auth.
  async function resendEmailCode() {}

  // TODO: save via @errand/api profile.update({ show_on_leaderboards }).
  async function setShowOnLeaderboards(show: boolean) {
    await startSession({ ...current(), show_on_leaderboards: show });
  }

  // TODO: upload to the backend's "avatars" bucket (avatars/{userId}.jpg),
  // then profile.update({ avatar_url }) with the stored file's URL.
  async function setAvatar(uri: string) {
    await startSession({ ...current(), avatar_url: uri });
  }

  // TODO: profile.update via @errand/api; a new email gets a code first.
  async function updateProfile(details: ProfileDetails) {
    const emailChanged = (details.email ?? '') !== (user?.email ?? '');
    await startSession({
      ...current(),
      ...details,
      email_verified: emailChanged ? false : user?.email_verified,
    });
  }

  // TODO: auth.changePassword(current, next) via @errand/api; it should
  // reject a wrong current password. The mock accepts anything.
  async function changePassword(_current: string, _next: string) {}

  // TODO: account.delete via @errand/api (removes profile, photo, chats;
  // keeps payment records the law requires, anonymised).
  async function deleteAccount() {
    signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        isSignedIn,
        user,
        isRestoring,
        signIn,
        signUp,
        signOut,
        verifyEmail,
        resendEmailCode,
        setShowOnLeaderboards,
        setAvatar,
        updateProfile,
        changePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
