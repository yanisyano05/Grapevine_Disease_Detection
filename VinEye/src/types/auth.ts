export interface User {
  /** UUID v4 (guest) ou id retourné par le backend (compte synchronisé). */
  id: string;
  name: string;
  /** null pour les invités (compte généré sans email). */
  email: string | null;
  isGuest: boolean;
  /** ISO 8601. */
  createdAt: string;
  /** Champs hydratés depuis /api/mobile/auth/me — absents tant que le compte
   *  n'a pas été synchronisé (offline ou guest). */
  role?: "USER" | "ADMIN";
  xp?: number;
  level?: number;
  banned?: boolean;
  bannedReason?: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  hasAcceptedTerms: boolean;
}
