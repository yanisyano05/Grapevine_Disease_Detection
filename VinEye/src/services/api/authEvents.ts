// Lightweight pub/sub for auth-impacting HTTP events. apiPost emits when it
// sees 401 (token expired/invalid) or 403 with banned: true. AuthContext
// subscribes to react globally without prop-drilling.

type AuthEvent =
  | { type: 'unauthorized' }
  | { type: 'banned'; reason: string | null };

type Listener = (event: AuthEvent) => void;

const listeners = new Set<Listener>();

export function emitAuthEvent(event: AuthEvent): void {
  listeners.forEach((l) => {
    try {
      l(event);
    } catch (err) {
      console.warn('[authEvents] listener threw:', err);
    }
  });
}

export function subscribeAuthEvents(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
