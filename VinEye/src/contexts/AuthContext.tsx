import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import * as authStorage from '@/services/auth/authStorage';
import { generateGuestUser } from '@/services/auth/randomUser';
import {
  getDeviceId,
  getToken,
  removeToken,
  saveToken,
} from '@/services/auth/tokenStorage';
import {
  fetchMe,
  signOutServer,
  syncUser,
  type MobileServerUser,
} from '@/services/api/auth';
import { subscribeAuthEvents } from '@/services/api/authEvents';
import type { User } from '@/types/auth';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  hasAcceptedTerms: boolean;
  isLoading: boolean;
  isBanned: boolean;
  bannedReason: string | null;
  login: (name: string, email: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  resetAccount: () => Promise<void>;
  acceptTerms: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function fromServerUser(server: MobileServerUser): User {
  return {
    id: server.id,
    name: server.name,
    email: server.email,
    isGuest: false,
    createdAt: server.createdAt,
    role: server.role,
    xp: server.xp,
    level: server.level,
    banned: server.banned,
    bannedReason: server.bannedReason,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);
  const [bannedReason, setBannedReason] = useState<string | null>(null);
  const userRef = useRef<User | null>(null);
  userRef.current = user;

  // Optimistic hydration from AsyncStorage; never block the splash on the network.
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
        if (storedUser?.banned) {
          setIsBanned(true);
          setBannedReason(storedUser.bannedReason ?? null);
        }
      } finally {
        if (alive) setIsLoading(false);
      }
    })();

    // Background refresh: hit /auth/me to pick up server-side ban changes
    // applied while the app was closed. Failures are silent (offline-friendly).
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetchMe();
        if (!alive) return;
        if (res.success) {
          const fresh = fromServerUser(res.data.user);
          setUser(fresh);
          await authStorage.saveUser(fresh);
          setIsBanned(fresh.banned ?? false);
          setBannedReason(fresh.bannedReason ?? null);
        }
        // 401 → emitted by the client; subscribeAuthEvents handles logout
        // 403 banned → also emitted by the client and handled below
      } catch (err) {
        if (__DEV__) console.warn('[Auth] fetchMe failed:', err);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // React to 401/banned events emitted from anywhere in the app.
  useEffect(() => {
    const unsub = subscribeAuthEvents((event) => {
      if (event.type === 'banned') {
        setIsBanned(true);
        setBannedReason(event.reason);
        // Persist so the modal stays visible across restarts even if /auth/me
        // is unreachable.
        const current = userRef.current;
        if (current) {
          void authStorage.saveUser({
            ...current,
            banned: true,
            bannedReason: event.reason,
          });
        }
      } else if (event.type === 'unauthorized') {
        // Token revoked or expired — wipe credentials and send the user
        // back to the onboarding flow.
        void (async () => {
          await removeToken();
          await authStorage.resetAuth();
          setUser(null);
          setIsOnboardingComplete(false);
          setHasAcceptedTerms(false);
          setIsBanned(false);
          setBannedReason(null);
        })();
      }
    });
    return unsub;
  }, []);

  const login = useCallback(async (name: string, email: string) => {
    const deviceId = await getDeviceId();
    const res = await syncUser({
      name: name.trim(),
      email: email.trim(),
      deviceId,
    });
    if (!res.success) {
      // Surface the failure so the AuthChoiceScreen can show a toast and
      // keep the user on the form instead of marking onboarding complete.
      const msg = res.error.message || 'Network error';
      throw new Error(msg);
    }
    const fresh = fromServerUser(res.data.user);
    await saveToken(res.data.token);
    await authStorage.saveUser(fresh);
    setUser(fresh);
    setIsBanned(fresh.banned ?? false);
    setBannedReason(fresh.bannedReason ?? null);
  }, []);

  const loginAsGuest = useCallback(async () => {
    const newUser = generateGuestUser();
    await authStorage.saveUser(newUser);
    setUser(newUser);
    setIsBanned(false);
    setBannedReason(null);
  }, []);

  const logout = useCallback(async () => {
    // Best-effort: revoke the server session, but never block the UI on it.
    try {
      await signOutServer();
    } catch {
      // ignored
    }
    await removeToken();
    await authStorage.resetAuth();
    setUser(null);
    setIsOnboardingComplete(false);
    setHasAcceptedTerms(false);
    setIsBanned(false);
    setBannedReason(null);
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
    isBanned,
    bannedReason,
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
