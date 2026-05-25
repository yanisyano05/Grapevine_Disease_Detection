// Web : injecte le lien manifest dans le <head> et enregistre le service worker.
// Appelé une fois au montage de l'app (App.tsx).
export function registerPWA(): void {
  if (typeof document !== 'undefined' && !document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    document.head.appendChild(link);
  }

  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    // best-effort : ne jamais casser l'app si le SW échoue.
    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    };
    // registerPWA() est appelé depuis un useEffect : l'événement `load` est
    // souvent déjà passé → enregistrer tout de suite si le document est prêt,
    // sinon attendre `load`. (Sans ça, le SW ne s'enregistrait jamais.)
    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register);
    }
  }
}
