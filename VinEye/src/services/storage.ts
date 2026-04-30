import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  GAME_PROGRESS: '@vineye:game_progress',
  SCAN_HISTORY: '@vineye:scan_history',
  LANGUAGE: '@vineye:language',
  LOCATION_PERMISSION_ASKED: '@vineye:location-permission-asked',
  USER_PROFILE: '@vineye:user_profile',
  NOTIFICATIONS_ENABLED: '@vineye:notifications_enabled',
} as const;

async function get<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function set<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage errors are non-critical — fail silently
  }
}

async function remove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // Ignore removal errors
  }
}

async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  } catch {
    // Ignore errors
  }
}

export const storage = { get, set, remove, clearAll, KEYS };
