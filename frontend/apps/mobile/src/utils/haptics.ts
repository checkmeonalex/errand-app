import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Turned off from Settings → Preferences ("Vibration on tap"). SettingsContext
// keeps this in sync with the saved preference.
let enabled = true;

export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

// A light "tick" for taps on main actions. Does nothing on web or when the
// user turned it off, and never throws (some Android phones disable haptics).
export function tapFeedback(): void {
  if (!enabled || Platform.OS === 'web') return;
  Haptics.selectionAsync().catch(() => {});
}
