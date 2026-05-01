import AsyncStorage from '@react-native-async-storage/async-storage';

import type { User } from '@/types/auth';

const KEYS = {
  USER: 'vineye:auth:user',
  ONBOARDING: 'vineye:auth:onboarding-done',
  TERMS: 'vineye:auth:terms-accepted-at',
} as const;

// === User ===

export async function getUser(): Promise<User | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.USER);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<User>;
    if (
      typeof parsed.id !== 'string' ||
      typeof parsed.name !== 'string' ||
      typeof parsed.isGuest !== 'boolean' ||
      typeof parsed.createdAt !== 'string'
    ) {
      return null;
    }
    return {
      id: parsed.id,
      name: parsed.name,
      email: typeof parsed.email === 'string' ? parsed.email : null,
      isGuest: parsed.isGuest,
      createdAt: parsed.createdAt,
    };
  } catch {
    return null;
  }
}

export async function saveUser(user: User): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.USER);
}

// === Onboarding ===

export async function getOnboardingStatus(): Promise<boolean> {
  const v = await AsyncStorage.getItem(KEYS.ONBOARDING);
  return v === 'true';
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING, 'true');
}

// === Terms ===

export async function getTermsAcceptance(): Promise<{
  accepted: boolean;
  acceptedAt: string | null;
}> {
  const v = await AsyncStorage.getItem(KEYS.TERMS);
  if (!v) return { accepted: false, acceptedAt: null };
  return { accepted: true, acceptedAt: v };
}

export async function setTermsAccepted(): Promise<void> {
  await AsyncStorage.setItem(KEYS.TERMS, new Date().toISOString());
}

// === Reset ===

export async function resetAuth(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.USER, KEYS.ONBOARDING, KEYS.TERMS]);
}
