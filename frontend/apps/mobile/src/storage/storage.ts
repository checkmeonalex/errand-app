import AsyncStorage from '@react-native-async-storage/async-storage';

// Saves app data on the device (AsyncStorage on phones, localStorage on web)
// so it survives reloads until the backend exists. Not encrypted: never store
// passwords or tokens here (use expo-secure-store for those).
//
// Every key is listed here. Bump the version in a key if its saved shape
// changes, so old data is ignored instead of breaking the app.
export const STORAGE_KEYS = {
  session: 'taskly:v1:session',
  tasks: 'taskly:v1:tasks',
  activeMode: 'taskly:v1:activeMode',
  chats: 'taskly:v1:chats',
  settings: 'taskly:v1:settings',
  reviews: 'taskly:v1:reviews',
  reports: 'taskly:v1:reports',
  notifications: 'taskly:v1:notifications',
  notificationsReadAt: 'taskly:v1:notificationsReadAt',
  runnerRulesSeen: 'taskly:v1:runnerRulesSeen',
  runnerDrops: 'taskly:v1:runnerDrops',
  runnerWaitlist: 'taskly:v1:runnerWaitlist',
  devRunnerAccess: 'taskly:v1:devRunnerAccess',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// The saved value, or null if nothing is saved or it can't be read.
export async function loadJSON<T>(key: StorageKey): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

// Saving is best-effort: a failure is logged, never thrown, so the app
// keeps working with what's in memory.
export async function saveJSON(key: StorageKey, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Could not save ${key}`, error);
  }
}

export async function removeKey(key: StorageKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn(`Could not remove ${key}`, error);
  }
}
