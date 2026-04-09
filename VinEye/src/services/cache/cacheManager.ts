import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG } from "@/config/api";

const PREFIX = "vineye_cache_";

interface CachedEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return null;

    const entry: CachedEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > entry.ttl) {
      // Expired — remove silently
      AsyncStorage.removeItem(PREFIX + key);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(
  key: string,
  data: T,
  ttl: number = API_CONFIG.cacheTTL,
): Promise<void> {
  const entry: CachedEntry<T> = { data, timestamp: Date.now(), ttl };
  await AsyncStorage.setItem(PREFIX + key, JSON.stringify(entry));
}

export async function cacheIsValid(key: string): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return false;

    const entry: CachedEntry<unknown> = JSON.parse(raw);
    return Date.now() - entry.timestamp <= entry.ttl;
  } catch {
    return false;
  }
}

export async function cacheClear(keyPrefix?: string): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const toRemove = keys.filter((k) =>
    keyPrefix ? k.startsWith(PREFIX + keyPrefix) : k.startsWith(PREFIX),
  );
  if (toRemove.length > 0) {
    await AsyncStorage.multiRemove(toRemove);
  }
}
