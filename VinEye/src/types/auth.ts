export interface User {
  /** UUID v4 généré via expo-crypto. */
  id: string;
  name: string;
  /** null pour les invités (compte généré sans email). */
  email: string | null;
  isGuest: boolean;
  /** ISO 8601. */
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  hasAcceptedTerms: boolean;
}
