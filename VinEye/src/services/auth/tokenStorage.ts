import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TOKEN_KEY = 'vineye_session_token';
const DEVICE_ID_KEY = 'vineye_device_id';

// SecureStore is unavailable on web and on some legacy Android setups; we
// fall back to AsyncStorage so the auth flow keeps working in dev (Expo Go
// web preview) at the cost of weaker secrecy.
let secureAvailable: boolean | null = null;

async function isSecureAvailable(): Promise<boolean> {
  if (secureAvailable !== null) return secureAvailable;
  if (Platform.OS === 'web') {
    secureAvailable = false;
    return false;
  }
  try {
    secureAvailable = await SecureStore.isAvailableAsync();
  } catch {
    secureAvailable = false;
  }
  return secureAvailable;
}

async function readSecure(key: string): Promise<string | null> {
  if (await isSecureAvailable()) {
    return SecureStore.getItemAsync(key);
  }
  return AsyncStorage.getItem(key);
}

async function writeSecure(key: string, value: string): Promise<void> {
  if (await isSecureAvailable()) {
    await SecureStore.setItemAsync(key, value);
    return;
  }
  await AsyncStorage.setItem(key, value);
}

async function deleteSecure(key: string): Promise<void> {
  if (await isSecureAvailable()) {
    await SecureStore.deleteItemAsync(key);
    return;
  }
  await AsyncStorage.removeItem(key);
}

export async function saveToken(token: string): Promise<void> {
  await writeSecure(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return readSecure(TOKEN_KEY);
}

export async function removeToken(): Promise<void> {
  await deleteSecure(TOKEN_KEY);
}

// A stable per-install device id. Used as part of the deterministic mobile
// auth password — must persist across logouts so the same email keeps the
// same backend account on this device.
export async function getDeviceId(): Promise<string> {
  const existing = await readSecure(DEVICE_ID_KEY);
  if (existing) return existing;
  const fresh = Crypto.randomUUID();
  await writeSecure(DEVICE_ID_KEY, fresh);
  return fresh;
}
