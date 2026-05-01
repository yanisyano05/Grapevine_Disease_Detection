import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import * as Crypto from 'expo-crypto';

import * as authStorage from '@/services/auth/authStorage';
import { generateGuestUser } from '@/services/auth/randomUser';
import type { User } from '@/types/auth';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  hasAcceptedTerms: boolean;
  isLoading: boolean;
  login: (name: string, email: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  resetAccount: () => Promise<void>;
  acceptTerms: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from AsyncStorage on mount
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [storedUser, onboarding, terms] = await Promise.all([
          authStorage.getUser(),
          authStorage.getOnboardingStatus(),
          authStorage.getTermsAcceptance(),
        ]);
        if (!alive) return;
        setUser(storedUser);
        setIsOnboardingComplete(onboarding);
        setHasAcceptedTerms(terms.accepted);
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (name: string, email: string) => {
    const newUser: User = {
      id: Crypto.randomUUID(),
      name: name.trim(),
      email: email.trim(),
      isGuest: false,
      createdAt: new Date().toISOString(),
    };
    await authStorage.saveUser(newUser);
    setUser(newUser);
  }, []);

  const loginAsGuest = useCallback(async () => {
    const newUser = generateGuestUser();
    await authStorage.saveUser(newUser);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    await authStorage.resetAuth();
    setUser(null);
    setIsOnboardingComplete(false);
    setHasAcceptedTerms(false);
  }, []);

  const resetAccount = useCallback(async () => {
    await logout();
  }, [logout]);

  const acceptTerms = useCallback(async () => {
    await authStorage.setTermsAccepted();
    setHasAcceptedTerms(true);
  }, []);

  const completeOnboarding = useCallback(async () => {
    await authStorage.setOnboardingComplete();
    setIsOnboardingComplete(true);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isOnboardingComplete,
    hasAcceptedTerms,
    isLoading,
    login,
    loginAsGuest,
    logout,
    resetAccount,
    acceptTerms,
    completeOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
